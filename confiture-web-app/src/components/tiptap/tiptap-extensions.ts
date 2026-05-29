import { Attributes, Extensions, NodeView, NodeViewRendererProps } from "@tiptap/core";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Image from "@tiptap/extension-image";
import Typography from "@tiptap/extension-typography";
import { Dropcursor } from "@tiptap/extensions";
import { VueNodeViewRenderer, ResizableNodeView, Editor, VueNodeViewRendererOptions } from "@tiptap/vue-3";
import { useResizeObserver } from "@vueuse/core";
import css from "highlight.js/lib/languages/css";
import js from "highlight.js/lib/languages/javascript";
import ts from "highlight.js/lib/languages/typescript";
import html from "highlight.js/lib/languages/xml";
import { common, createLowlight } from "lowlight";
import { AraTiptapRenderedExtension } from "./AraTiptapRenderedExtension";
import { ExtendedLinkExtension, LinkExtension } from "./extensions/LinkExtension";
import { MarkdownExtension } from "./extensions/MarkdownExtension";
import { getStarterKitExtensions } from "./extensions/StarterKitExtensions";
import { CustomHeading } from "./heading/HeadingExtension";
import { ImageUploadExtension } from "./image/ImageUploadExtension";
import TiptapImage from "./image/TiptapImage.vue";
import { PasteMarkdownExtension } from "./markdown/PasteMarkdownExtension";
import { getTiptapBasicEditorExtensions, tiptapRenderedBasicExtensions } from "./tiptap-basic-extensions";

// Minimum editor inner width (in px) to enable image resize
const minWidthToEnableImageResize = 320;

// LowLight languages
const lowlight = createLowlight(common);

lowlight.register("html", html);
lowlight.register("css", css);
lowlight.register("js", js);
lowlight.register("ts", ts);

/**
 * have all extensions (starterKit, heading, codeBlock, typography and dropCursor)
 */
const commonExtensions: Extensions = [
  CustomHeading,
  getStarterKitExtensions({
    codeBlock: false,
    dropcursor: false,
    heading: false,
    link: false,
    underline: false
  }),
  CodeBlockLowlight.configure({ lowlight, defaultLanguage: "html" }),
  Typography.configure({
    openDoubleQuote: "« ",
    closeDoubleQuote: " »"
  }),
  MarkdownExtension,
  Dropcursor.configure({ color: "var(--dsfr-outline)", width: 3 })
];

const commonImageAttrs = {
  loading: {
    parseHTML: () => "lazy",
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

/**
 * have all extensions for tiptap rendered (with Image)
 */
const tiptapRenderedExtensions: Extensions = [
  ...commonExtensions,
  ExtendedLinkExtension,
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
  AraTiptapRenderedExtension
];

export function getTiptapEditorExtensions(options?: {
  basicMode: boolean;
  onImageUploadComplete: (fileName: string) => void;
}) {
  if (options?.basicMode === true) {
    return getTiptapBasicEditorExtensions();
  }

  return [
    ...commonExtensions,
    PasteMarkdownExtension,
    LinkExtension,
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
      },
      parseHTML() {
        const baseURL = window.location.origin;
        return [
          {
            tag: `img[src^=\"/uploads/\"], img[src^=\"${baseURL}/uploads/\"]`
          }
        ];
      }
    }),
    options?.onImageUploadComplete ?
        ImageUploadExtension.configure({
          onImageUploadComplete: options.onImageUploadComplete
        })
      : ImageUploadExtension
  ];
}

export function getTipTapRenderedExtensions(basicMode: boolean) {
  if (basicMode) {
    return tiptapRenderedBasicExtensions;
  }

  return tiptapRenderedExtensions;
}

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
  const imgs = editorElement.querySelectorAll("img") as NodeListOf<HTMLImageElement>;
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
