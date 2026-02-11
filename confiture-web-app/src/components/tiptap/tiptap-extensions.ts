import { Attributes, Extensions, NodeViewRendererProps, textblockTypeInputRule } from "@tiptap/core";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";

import { Heading, type Level } from "@tiptap/extension-heading";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Typography from "@tiptap/extension-typography";
import { Dropcursor } from "@tiptap/extensions";
import { Markdown } from "@tiptap/markdown";
import StarterKit from "@tiptap/starter-kit";
import { VueNodeViewRenderer, ResizableNodeView } from "@tiptap/vue-3";
import css from "highlight.js/lib/languages/css";
import js from "highlight.js/lib/languages/javascript";
import ts from "highlight.js/lib/languages/typescript";
import html from "highlight.js/lib/languages/xml";
import { common, createLowlight } from "lowlight";

import { useWindowWidth } from "../../composables/useWindowWidth";
import { AraTiptapRenderedExtension } from "./AraTiptapRenderedExtension";
import TiptapImage from "./image//TiptapImage.vue";
import { ImageUploadExtension } from "./image/ImageUploadExtension";

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
  Markdown.configure(),
  Dropcursor.configure({ color: "var(--dsfr-outline)", width: 3 })
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

export function getTiptapEditorExtensions(options: {
  onImageUploadComplete: (fileName: string) => void;
}) {
  const { onImageUploadComplete } = options;
  return [
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
        return (props) => {
          const vueNodeView: any = VueNodeViewRenderer(TiptapImage)(props);

          if (!vueNodeView.HTMLAttributes) {
            return vueNodeView;
          }

          // if mobile, we don't resize
          const width = useWindowWidth().value;
          if (width < 768) {
            return vueNodeView;
          }

          return createResizableNodeView(props, vueNodeView);
        };
      }
    }),
    ImageUploadExtension.configure({ onImageUploadComplete })
  ];
}

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

// create a resizable node view for picture
export const createResizableNodeView = (props: NodeViewRendererProps, vueNodeView: any): ResizableNodeView => {
  const img = document.createElement("img");

  Object.entries(vueNodeView.HTMLAttributes).forEach(([key, value]) => {
    if (value == null) return;
    if (key === "width" || key === "height") return;
    img.setAttribute(key, String(value));
  });

  const node = vueNodeView.node;

  // hack for respect picture's size
  node.attrs.height = "auto";

  const resizableView = new ResizableNodeView({
    ...props,
    element: img,
    node,
    onResize: (w, h) => {
      img.style.width = `${w}px`;
      img.style.height = `${h}px`;
    },
    onCommit: (w, h) => {
      props.editor.commands.updateAttributes("image", { width: w, height: h });
    },
    onUpdate: (updatedNode) => {
      if (updatedNode.type !== node.type) return false;
      return true;
    },
    options: {
      preserveAspectRatio: true
    }
  });

  // Check if the image node is currently selected in the editor
  const isSelected = () => {
    const nodePos = props.getPos();
    if (!nodePos) {
      return false;
    }
    const { selection } = props.editor.state;
    return selection.from == nodePos;
  };

  // handleKeyDown to manage image resizing with ALT + Arrow
  const handleKeydown = (e: KeyboardEvent) => {
    if (!isSelected() || !e.altKey) return;

    if (!["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"].includes(e.key)) return;

    e.preventDefault();
    e.stopPropagation();

    const step = 10;
    const currentWidth = img.offsetWidth || parseInt(img.style.width) || 200;
    const currentHeight = img.offsetHeight || parseInt(img.style.height) || 200;
    const aspectRatio = currentWidth / currentHeight;

    let newWidth = currentWidth;
    let newHeight = currentHeight;

    switch (e.key) {
      case "ArrowRight":
        newWidth = currentWidth + step;
        newHeight = newWidth / aspectRatio;
        break;
      case "ArrowLeft":
        newWidth = Math.max(50, currentWidth - step);
        newHeight = newWidth / aspectRatio;
        break;
      case "ArrowUp":
        newHeight = Math.max(50, currentHeight - step);
        newWidth = newHeight * aspectRatio;
        break;
      case "ArrowDown":
        newHeight = currentHeight + step;
        newWidth = newHeight * aspectRatio;
        break;
    }

    const currentTarget = e.currentTarget as HTMLElement;
    if (newWidth > currentTarget.offsetWidth - 15) {
      return;
    }

    // Apply resize
    resizableView.onResize?.(newWidth, newHeight);
    resizableView.onCommit?.(newWidth, newHeight);
  };

  // Capture phase to intercept before Tiptap handles it
  props.editor.view.dom.addEventListener("keydown", handleKeydown, true);

  // Cleanup on destroy
  const originalDestroy = resizableView.destroy?.bind(resizableView);
  resizableView.destroy = () => {
    props.editor.view.dom.removeEventListener("keydown", handleKeydown, true);
    originalDestroy?.();
  };

  return resizableView;
};
