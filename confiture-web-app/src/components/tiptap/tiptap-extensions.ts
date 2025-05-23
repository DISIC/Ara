import {
  Extensions,
  mergeAttributes,
  textblockTypeInputRule
} from "@tiptap/core";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import DropCursor from "@tiptap/extension-dropcursor";
import { Heading, type Level } from "@tiptap/extension-heading";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import StarterKit from "@tiptap/starter-kit";
import css from "highlight.js/lib/languages/css";
import js from "highlight.js/lib/languages/javascript";
import ts from "highlight.js/lib/languages/typescript";
import html from "highlight.js/lib/languages/xml";
import { common, createLowlight } from "lowlight";
import { Markdown } from "tiptap-markdown";

// Define needed heading levels
export const displayedHeadings = [4, 5, 6] as Array<Level>;

// LowLight languages
const lowlight = createLowlight(common);

lowlight.register("html", html);
lowlight.register("css", css);
lowlight.register("js", js);
lowlight.register("ts", ts);

interface TiptapExtensionsParams {
  placeholder?: string;
}

export function getTiptapExtensions(
  params?: TiptapExtensionsParams
): Extensions {
  return [
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
    Link.extend({
      addAttributes() {
        return {
          ...this.parent?.(),
          class: {
            default: null,
            renderHTML: () => {
              return { class: null }; // reset class when copy pasting for example
            }
          },
          title: {
            default: null,
            renderHTML: (attributes) => {
              return {
                title: attributes.title
              };
            }
          }
        };
      },
      renderHTML({ HTMLAttributes }) {
        return ["a", mergeAttributes(HTMLAttributes), 0];
      }
    }).configure({
      openOnClick: false,
      defaultProtocol: "https"
    }),
    Typography.configure({
      openDoubleQuote: "« ",
      closeDoubleQuote: " »"
    }),
    Markdown.configure({ linkify: true }),
    Image,
    DropCursor.configure({ color: "var(--dsfr-outline)", width: 3 }),
    ...(params?.placeholder
      ? [
          Placeholder.configure({
            placeholder: params.placeholder,
            showOnlyWhenEditable: true,
            emptyEditorClass: "tiptap-container--empty"
          })
        ]
      : [])
  ];
}
