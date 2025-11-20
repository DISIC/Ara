import { Plugin, PluginKey, Transaction } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

/**
 * Placeholder plugin
 *
 * Handles the [widget decoration](https://prosemirror.net/docs/ref/#view.Decoration%5Ewidget)
 * that is used before an image is actually uploaded.
 * The widget decoration is an image blob (local to browser), a bit transparent.
 */
export class PlaceholderPlugin extends Plugin {
  constructor() {
    super({
      key: new PluginKey("placeholder"),
      state: {
        init() {
          return DecorationSet.empty;
        },
        apply: (tr: Transaction, set: DecorationSet) =>
          this.apply(tr, set)
      },
      props: {
        decorations(state) {
          return this.getState(state);
        }
      }
    });
  }

  private apply(tr: Transaction, set: DecorationSet): DecorationSet {
    const trDoc = tr.doc;

    // Adjust decoration positions to changes made by the transaction
    set = set.map(tr.mapping, trDoc);

    // See if the transaction adds or removes any placeholders
    const action = tr.getMeta(this);
    if (action && action.add) {
      const deco = Decoration.widget(
        action.add.pos,
        () => {
          return action.add.element;
        },
        {
          id: action.add.id,
          width: action.add.element.width.toString(),
          height: action.add.element.height.toString()
        }
      );
      set = set.add(trDoc, [deco]);
    } else if (action && action.remove) {
      set = set.remove(
        set.find(undefined, undefined, (spec) => spec.id == action.remove.id)
      );

      action.element.remove();
    }
    return set;
  }
}
