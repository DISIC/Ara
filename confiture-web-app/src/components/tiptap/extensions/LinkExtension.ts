import Link from "@tiptap/extension-link";

const extendedLink = Link.extend({
  addAttributes() {
    // Default attributes are useful when pasting links in editor for example.
    return {
      ...this.parent?.(),
      // "class" is always reset
      class: {
        default: null,
        parseHTML: () => null,
        renderHTML: () => {
          return {
            class: null
          };
        }
      },
      // "rel" is always reset to "noopener noreferrer"
      rel: {
        default: null,
        parseHTML: () => "noopener noreferrer",
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

export const ExtendedLinkExtension = extendedLink.configure({
  openOnClick: true,
  HTMLAttributes: {
    // Links open in a new window when displaying the editor in read-only mode
    target: "_blank"
  }
});

export const LinkExtension =
  extendedLink.configure({
    openOnClick: false,
    defaultProtocol: "https",
    shouldAutoLink: () => true,
    HTMLAttributes: {
      // Links do not open when editing, so not "new window"…
      // Advantage: no extra icon when editing
      target: null
    }
  });
