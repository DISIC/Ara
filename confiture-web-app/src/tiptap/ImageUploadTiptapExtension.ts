import { Extension } from "@tiptap/core";
import { Slice } from "@tiptap/pm/model";
import { EditorState, Plugin } from "@tiptap/pm/state";
import { Decoration, DecorationSet, EditorView } from "@tiptap/pm/view";

import { FileErrorMessage } from "../enums";
import { useAuditStore } from "../store/audit";
import { AuditFile, FileDisplay } from "../types";
import { getUploadUrl, handleFileUploadError } from "../utils";

export interface ImageUploadTiptapExtensionOptions {
  uniqueId: string;
}

/**
 * Placeholder: the image blob (local to browser), with 50% opacity
 */
const placeholderPlugin = new Plugin({
  state: {
    init() {
      return DecorationSet.empty;
    },
    apply(tr, set) {
      // Adjust decoration positions to changes made by the transaction
      set = set.map(tr.mapping, tr.doc);
      // See if the transaction adds or removes any placeholders
      const action = tr.getMeta(placeholderPlugin);
      if (action && action.add) {
        const deco = Decoration.widget(
          action.add.pos,
          () => {
            return action.add.blobElement;
          },
          {
            id: action.add.id,
            width: action.add.blobElement.width.toString(),
            height: action.add.blobElement.height.toString()
          }
        );
        set = set.add(tr.doc, [deco]);
      } else if (action && action.remove) {
        set = set.remove(
          set.find(undefined, undefined, (spec) => spec.id == action.remove.id)
        );
      }
      return set;
    }
  },
  props: {
    decorations(state) {
      return this.getState(state);
    }
  }
});

const HandleDropPlugin = (options: ImageUploadTiptapExtensionOptions) => {
  const { uniqueId } = options;
  return new Plugin({
    props: {
      handleDrop(
        this: Plugin<any>,
        view: EditorView,
        dragEvent: DragEvent,
        slice: Slice,
        moved: boolean
      ): boolean {
        if (moved || !dragEvent.dataTransfer || !dragEvent.dataTransfer.files) {
          return false;
        }
        if (dragEvent.dataTransfer.files.length === 0) {
          // TODO external URL?
          return false;
        }

        const files: FileList = dragEvent.dataTransfer.files;
        for (let i = 0, il = files.length, file: File; i < il; i++) {
          file = files.item(i)!;

          // If dropping external files
          if (file.size < 2000000) {
            // A fresh object to act as the ID for this upload
            const id = {};

            // Place the now uploaded image in the editor where it was dropped
            const { tr } = view.state;
            const position = view.posAtCoords({
              left: dragEvent.clientX,
              top: dragEvent.clientY
            });
            if (!position) {
              console.warn("No position?!");
              return false;
            }

            // If image is being dropped *inside* a node,
            // move it to next "gap", between 2 nodes
            let pos = position.pos;
            if (isDropCursorVertical(view, pos)) {
              pos = view.state.doc.resolve(position.pos).end() + 1;
            }

            const _URL = window.URL || window.webkitURL;
            const blobUrl = _URL.createObjectURL(file);
            const blobElement: HTMLImageElement = document.createElement("img");
            blobElement.setAttribute("src", blobUrl);
            blobElement.onload = () => {
              tr.setMeta(placeholderPlugin, {
                add: { id, blobElement, pos }
              });
              view.dispatch(tr);

              uploadAndReplacePlaceHolder(view, file, id);
            };
          } else {
            //FIXME: use a notification
            window.alert(FileErrorMessage.UPLOAD_SIZE);
          }
        }

        // handled
        return true;
      }
    }
  });

  function uploadAndReplacePlaceHolder(view: EditorView, file: File, id: any) {
    const auditStore = useAuditStore();
    auditStore.uploadAuditFile(uniqueId, file, FileDisplay.EDITOR).then(
      (response: AuditFile) => {
        const placeholder = findPlaceholderDecoration(view.state, id);
        const pos: number | undefined = placeholder?.from;

        // If the content around the placeholder has been deleted, drop
        // the image
        if (pos === undefined) {
          //TODO remove image from server
          return;
        }

        const width: string = placeholder?.spec.width;
        const height: string = placeholder?.spec.height;

        // Otherwise, insert it at the placeholder's position, and remove
        // the placeholder
        const imgUrl = getUploadUrl(response.key);
        view.dispatch(
          view.state.tr
            .replaceWith(
              pos,
              pos,
              view.state.schema.nodes.image.create({
                width,
                height,
                src: imgUrl
              })
            )
            .setMeta(placeholderPlugin, { remove: { id } })
        );
      },
      async (reason: any) => {
        // On failure, just clean up the placeholder
        view.dispatch(
          view.state.tr.setMeta(placeholderPlugin, { remove: { id } })
        );
        //FIXME: use a notification
        window.alert(await handleFileUploadError(reason));
      }
    );
  }

  function findPlaceholderDecoration(
    state: EditorState,
    id: any
  ): Decoration | undefined {
    const decos = placeholderPlugin.getState(state);
    const found = decos?.find(undefined, undefined, (spec) => spec.id == id);
    return found?.[0];
  }
};

export const ImageUploadTiptapExtension =
  Extension.create<ImageUploadTiptapExtensionOptions>({
    name: "imageUpload",
    addProseMirrorPlugins() {
      return [
        HandleDropPlugin({ uniqueId: this.options.uniqueId }),
        placeholderPlugin
      ];
    },
    extendNodeSchema() {
      return {
        disableDropCursor: (
          view: EditorView,
          position: { pos: number; inside: number }
        ) => {
          return isDropCursorVertical(view, position.pos);
        }
      };
    }
  });

/**
 * Tells if the drop cursor is vertical (inline content)
 * @see prosemirror-dropcursor extension
 *
 * @param view:EditorView
 * @param pos:number
 * @returns boolean
 */
function isDropCursorVertical(view: EditorView, pos: number): boolean {
  if (!pos) {
    return false;
  }
  const $pos = view.state.doc.resolve(pos);
  return $pos.parent.inlineContent;
}
