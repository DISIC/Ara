import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "prosemirror-view";

export interface AraTiptapRenderedExtensionOptions {
  uniqueId: string;
}

/**
 * Plugin making links opening in a new window accessible by adding an invisible
 * span (`<span class="fr-sr-only"> (nouvelle fenêtre)</span>"`)
 *
 * ## Note
 * In the report, all links are converted to links openning in a new window.
 *
 * ## Warning
 * Use this plugin in read-only mode only, as it creates an issue when cursor
 * goes beyond the last character of the link:
 * - editor acts as if there were an extra "ghost character"
 * - cursor disappears when reaching that "ghost character"
 *
 * When the editor is editable, we decided to:
 * - remove `target="_blank"`
 * - not use this plugin (not necessary anymore)
 * - not open links on click
 * That way, it's easier to edit, with no extra icon and no issue with cursor.
 */
const accessibleLinkPlugin = new Plugin({
  key: new PluginKey("linkDecoration"),

  props: {
    decorations: ({ doc }) => {
      const decorations: Decoration[] = [];
      // Walk through the document to find all link marks
      doc.descendants((node, pos) => {
        if (node.isText && node.marks) {
          node.marks.forEach((mark) => {
            if (mark.type.name === "link") {
              // Find the end position of the link text
              const linkEnd = pos + node.nodeSize;
              // Create a decoration that adds the span after the link
              const decoration = Decoration.widget(
                linkEnd,
                () => {
                  const span = document.createElement("span");
                  span.className = "fr-sr-only";
                  span.textContent = " (nouvelle fenêtre)";
                  return span;
                },
                {
                  side: -1, // to be inside the `<a>` element and not after
                  key: `link-decoration-${pos}` // Unique key for each decoration
                }
              );
              decorations.push(decoration);
            }
          });
        }
      });
      return DecorationSet.create(doc, decorations);
    }
  }
});

/**
 * Extension AraTiptapRenderedExtension
 *
 * Tiptap extension for Ara specificities when editor is not editable:
 * - make links openning in a new window accessible
 */
export const AraTiptapRenderedExtension =
  Extension.create<AraTiptapRenderedExtensionOptions>({
    name: "ara",
    addProseMirrorPlugins() {
      return [accessibleLinkPlugin];
    }
  });
