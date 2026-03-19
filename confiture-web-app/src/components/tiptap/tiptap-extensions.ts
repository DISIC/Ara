import { Attributes, Extensions, NodeView, NodeViewRendererProps, textblockTypeInputRule } from "@tiptap/core";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { Heading, type Level } from "@tiptap/extension-heading";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Typography from "@tiptap/extension-typography";
import { Dropcursor } from "@tiptap/extensions";
import { Markdown } from "@tiptap/markdown";
import StarterKit from "@tiptap/starter-kit";
import { VueNodeViewRenderer, ResizableNodeView, Editor, VueNodeViewRendererOptions } from "@tiptap/vue-3";
import { useResizeObserver } from "@vueuse/core";
import css from "highlight.js/lib/languages/css";
import js from "highlight.js/lib/languages/javascript";
import ts from "highlight.js/lib/languages/typescript";
import html from "highlight.js/lib/languages/xml";
import { common, createLowlight } from "lowlight";
import { marked } from "marked";
import { AraTiptapRenderedExtension } from "./AraTiptapRenderedExtension";
import { ImageUploadExtension } from "./image/ImageUploadExtension";
import TiptapImage from "./image/TiptapImage.vue";
import { PasteMarkdownExtension } from "./markdown/MarkdownExtension";

// Define needed heading levels
export const displayedHeadings = [4, 5, 6] as Array<Level>;

// Minimum editor inner width (in px) to enable image resize
const minWidthToEnableImageResize = 320;

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
    heading: false,
    link: false
  }),
  CodeBlockLowlight.configure({ lowlight, defaultLanguage: "html" }),
  Typography.configure({
    openDoubleQuote: "« ",
    closeDoubleQuote: " »"
  }),
  Markdown,
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

export function getTiptapEditorExtensions(options?: {
  onImageUploadComplete: (fileName: string) => void;
}) {
  const uploadExtension = ImageUploadExtension;
  if (options?.onImageUploadComplete) {
    uploadExtension.configure({
      onImageUploadComplete: options.onImageUploadComplete
    });
  }
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
          const vueNodeView = VueNodeViewRenderer(TiptapImage)(props) as NodeView<typeof TiptapImage, Editor, VueNodeViewRendererOptions>;

          if (!vueNodeView.HTMLAttributes) {
            // <EditorContent> not rendered yet
            return vueNodeView;
          }

          return createResizableNodeView(props, vueNodeView);
        };
      }
    }),
    uploadExtension,
    PasteMarkdownExtension.configure()
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

// Create a resizable node view for each image
function createResizableNodeView(props: NodeViewRendererProps, vueNodeView: NodeView<typeof TiptapImage, Editor, VueNodeViewRendererOptions>): ResizableNodeView {
  const img = vueNodeView.dom.querySelector("img")!;
  const node = vueNodeView.node;
  const editorElement = vueNodeView.view.dom;

  const minImgWidth = 50;
  const minImgHeight = 30;
  const aspectRatio = img.width / img.height;

  const resizableView = new ResizableNodeView({
    ...props,
    element: img,
    node,
    onResize: (w, _h) => {
      const constrained = applyConstraints(editorElement, w, minImgWidth, minImgHeight, aspectRatio);
      img.width = constrained.w;
      img.height = constrained.h;

      img.style.width = `${constrained.w.toString()}px`;
      // ResizableNodeView#handleResize modifies both CSS width and height.
      // CSS height needs to be removed here in order to preserve aspect ratio
      // (height is defined to "auto" in CSS)
      img.style.removeProperty("height");
    },
    onCommit: (w, h) => {
      img.width = w;
      img.height = h;

      // Focus the editor in case user resizes an image with the mouse
      // while the editor is not focused
      props.editor.chain().focus().updateAttributes("image", {
        width: w,
        height: h
      }).run();
    },
    onUpdate: (updatedNode) => {
      img.style.width = `${updatedNode.attrs.width}px`;
      return true;
    },
    options: {
      preserveAspectRatio: true,
      directions: ["right", "bottom"]
      // Because resize constraint (max width) depends on the editor width,
      // we cannot use the `min` and `max` options
    }
  });

  // Remove CSS height to respect image aspect ratio
  // (height is defined to "auto" in CSS)
  img.style.removeProperty("height");

  // Check if the image node is currently selected in the editor
  const isSelected = () => {
    const nodePos = props.getPos();
    if (nodePos === undefined) {
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

    if (!isResizeEnabled(editorElement, img)) {
      return;
    }

    const step = 10;
    const currentWidth = img.offsetWidth;
    const aspectRatio = img.width / img.height;

    let newWidth;

    switch (e.key) {
      // Increase size (→ ↓)
      case "ArrowRight":
      case "ArrowDown":
        newWidth = currentWidth + step;
        break;

      // Decrease size (← ↑)
      case "ArrowLeft":
      case "ArrowUp":
        newWidth = currentWidth - step;
        break;

      default:
        return;
    }

    const constrained = applyConstraints(editorElement, newWidth, minImgWidth, minImgHeight, aspectRatio);

    // Apply resize
    if (newWidth !== currentWidth) {
      img.style.width = `${constrained.w}px`;
      img.width = constrained.w;
      img.height = constrained.h;
      props.editor.commands.updateAttributes("image", { width: constrained.w, height: constrained.h });
    };
  };

  // Capture phase to intercept before Tiptap handles it
  editorElement.addEventListener("keydown", handleKeydown, true);
  showOrHideHandles(editorElement);

  const { stop: stopObservingResize } = useResizeObserver(editorElement, () => {
    showOrHideHandles(editorElement);
  });

  // Cleanup on destroy
  const originalDestroy = resizableView.destroy?.bind(resizableView);
  resizableView.destroy = () => {
    editorElement.removeEventListener("keydown", handleKeydown, true);
    originalDestroy?.();
    stopObservingResize();
  };

  return resizableView;
};

function showOrHideHandles(editorElement: Element) {
  const imgs = editorElement.querySelectorAll("[data-drag-handle]") as NodeListOf<HTMLImageElement>;
  imgs.forEach((img) => {
    const handles = img.parentElement?.querySelectorAll("[data-resize-handle]") as NodeListOf<HTMLDivElement>;
    handles.forEach((handle) => {
      if (isResizeEnabled(editorElement, img)) {
        if (handle.style.display) {
          handle.style.removeProperty("display");
        }
      } else {
        handle.style.display = "none";
      }
    });
  });
}

function isResizeEnabled(editorElement: Element, img: HTMLImageElement) {
  const maxImgWidth = parseInt(editorElement.getAttribute("data-inner-width")!);
  // Enable resize if the editor is wide enough
  if (maxImgWidth > minWidthToEnableImageResize) {
    return true;
  }
  // Enable resize if the image current width is smaller than (or equal to) the editor width
  if (parseInt(img.getAttribute("width")!) <= maxImgWidth) {
    return true;
  }
}

function applyConstraints(editorElement: Element, newWidth: number, minImgWidth: number, minImgHeight: number, aspectRatio: number): { w: number; h: number } {
  // Max image width is editor inner width (offsetWidth - 2 × inline padding)
  const maxImgWidth = parseInt(editorElement.getAttribute("data-inner-width")!);
  let w = Math.min(newWidth, maxImgWidth);
  w = Math.max(w, minImgWidth);
  if (w / aspectRatio < minImgHeight) {
    w = Math.floor(minImgHeight * aspectRatio);
  }

  const h = Math.round(w / aspectRatio);

  return { w, h };
}

export function convertMarkdownToHTML(markdown: string): string {
  return marked(markdown) as string;
}
