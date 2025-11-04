import { Attributes, Extensions, textblockTypeInputRule } from "@tiptap/core";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import DropCursor from "@tiptap/extension-dropcursor";
import { Heading, type Level } from "@tiptap/extension-heading";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Typography from "@tiptap/extension-typography";
import StarterKit from "@tiptap/starter-kit";
import { VueNodeViewRenderer } from "@tiptap/vue-3";
import css from "highlight.js/lib/languages/css";
import js from "highlight.js/lib/languages/javascript";
import ts from "highlight.js/lib/languages/typescript";
import html from "highlight.js/lib/languages/xml";
import { common, createLowlight } from "lowlight";
import { Markdown } from "tiptap-markdown";
import { AraTiptapRenderedExtension } from "./AraTiptapRenderedExtension";
import { ImageUploadTiptapExtension } from "./ImageUploadExtension";
import TiptapImage from "./TiptapImage.vue";

// Define needed heading levels
export const displayedHeadings = [4, 5, 6] as Array<Level>;

// LowLight languages
const lowlight = createLowlight(common);

lowlight.register("html", html);
lowlight.register("css", css);
lowlight.register("js", js);
lowlight.register("ts", ts);

const extendedLink = Link.extend({
  addAttributes() {
    // Default attributes are useful when pasting links in editor for example.
    return {
      ...this.parent?.(),
      // "class" is always reset
      class: {
        default: null,
        renderHTML: () => {
          return {
            class: null
          };
        }
      },
      // "rel" is always reset to "noopener noreferrer"
      rel: {
        default: null,
        renderHTML: () => {
          return {
            rel: "noopener noreferrer"
          };
        }
      },
      // "target" is reset to:
      // - null (removed) when editing
      // - "_blank" when rendered
      target: {
        default: null,
        renderHTML: () => {
          return {
            target: this.options.HTMLAttributes.target
          };
        }
      }
    };
  }
});

const commonExtensions: Extensions = [
  Heading.extend({
    // prevent all marks from being applied to headings
    marks: "",
    // Shift heading levels when typing markdown
    // Example: "## Foobar" would render a `h5`
    addInputRules() {
      return this.options.levels.map((level) => {
        return textblockTypeInputRule({
          find: new RegExp(
            `^(#{${Math.min(...this.options.levels) - 3},${level - 3}})\\s$`
          ),
          type: this.type,
          getAttributes: {
            level
          }
        });
      });
    }
  }).configure({
    levels: displayedHeadings
  }),
  StarterKit.configure({
    codeBlock: false,
    dropcursor: false,
    heading: false
  }),
  CodeBlockLowlight.configure({ lowlight, defaultLanguage: "html" }),
  Typography.configure({
    openDoubleQuote: "« ",
    closeDoubleQuote: " »"
  }),
  Markdown.configure({ linkify: true }),
  DropCursor.configure({ color: "var(--dsfr-outline)", width: 3 })
];

const commonImageAttrs = {
  loading: {
    parseHTML: (element: HTMLElement) => element.getAttribute("loading"),
    renderHTML: () => {
      return {
        loading: "lazy"
      };
    }
  },
  width: {
    renderHTML: (attrs: Attributes) => {
      return {
        width: attrs.width
      };
    }
  },
  height: {
    renderHTML: (attrs: Attributes) => {
      return {
        height: attrs.height
      };
    }
  }
};
export const tiptapEditorExtensions: Extensions = [
  ...commonExtensions,
  extendedLink.configure({
    openOnClick: false,
    defaultProtocol: "https",
    shouldAutoLink: () => true,
    HTMLAttributes: {
      // Links do not open when editing, so not "new window"…
      // Advantage: no extra icon when editing
      target: null
    }
  }),
  Image.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        ...commonImageAttrs,
        alt: {
          renderHTML: (attrs) => {
            return {
              // In editor, alt is given by the uploaded file or "external"
              alt: attrs.alt
            };
          }
        },
        localURL: {
          parseHTML: (element: HTMLElement) => element.getAttribute("localURL")
        }
      };
    },
    addNodeView() {
      return VueNodeViewRenderer(TiptapImage);
    }
  }),
  ImageUploadTiptapExtension
];

export const tiptapRenderedExtensions: Extensions = [
  ...commonExtensions,
  extendedLink.configure({
    openOnClick: true,
    HTMLAttributes: {
      // Links open in a new window when displaying the editor in read-only mode
      target: "_blank"
    }
  }),
  Image.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        ...commonImageAttrs,
        alt: {
          renderHTML: () => {
            return {
              // All images are decorative when rendered
              alt: ""
            };
          }
        }
      };
    }
  }),
  ...[AraTiptapRenderedExtension]
];
