import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

export const CustomSelectionExtension = Extension.create({
  name: "CustomSelectionExtension",

  // Add a plugin to handle selection decorations
  addProseMirrorPlugins() {
    const key = new PluginKey("CustomSelectionExtension");

    return [
      new Plugin({
        key,
        props: {
          decorations: (state) => {
            const { selection } = state;
            const decorations: Decoration[] = [];

            // Add visual decoration to selected block nodes
            // without inline content (e.g. images)
            state.doc.nodesBetween(
              selection.from,
              selection.to,
              (node, pos) => {
                if (!node.isTextblock) {
                  decorations.push(
                    Decoration.node(pos, pos + node.nodeSize, {
                      class: "tiptap-selection"
                    })
                  );
                }
              }
            );

            return DecorationSet.create(state.doc, decorations);
          }
        }
      })
    ];
  }
});
