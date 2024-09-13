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
            const phImg: HTMLImageElement = document.createElement("img");
            phImg.setAttribute("src", action.add.blobUrl);
            phImg.onload = () => {
              phImg.setAttribute("width", phImg.width.toString());
              phImg.setAttribute("height", phImg.height.toString());
            };
            return phImg;
          },
          {
            id: action.add.id
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
      ): boolean | void {
        if (
          !moved &&
          dragEvent.dataTransfer &&
          dragEvent.dataTransfer.files &&
          dragEvent.dataTransfer.files[0]
        ) {
          // If dropping external files
          const file = dragEvent.dataTransfer.files[0];
          if (file.size < 2000000) {
            // A fresh object to act as the ID for this upload
            const id = {};

            // Place the now uploaded image in the editor where it was dropped
            const { tr } = view.state;
            const coordinates = view.posAtCoords({
              left: dragEvent.clientX,
              top: dragEvent.clientY
            });
            if (!coordinates) {
              console.log("No coordinates?!");
              return;
            }
            const _URL = window.URL || window.webkitURL;
            const blobUrl = _URL.createObjectURL(file);
            tr.setMeta(placeholderPlugin, {
              add: { id, blobUrl, pos: coordinates.pos }
            });
            view.dispatch(tr);

            uploadAndReplacePlaceHolder(view, file, id);
          } else {
            //FIXME: use a notification
            window.alert(FileErrorMessage.UPLOAD_SIZE);
          }

          // handled
          return true;
        }
      }
    }
  });

  function uploadAndReplacePlaceHolder(view: EditorView, file: File, id: any) {
    const auditStore = useAuditStore();
    auditStore.uploadAuditFile(uniqueId, file, FileDisplay.EDITOR).then(
      (response: AuditFile) => {
        const pos = findPlaceholder(view.state, id);
        // If the content around the placeholder has been deleted, drop
        // the image
        if (pos === undefined) {
          //TODO remove image from server
          return;
        }
        // Otherwise, insert it at the placeholder's position, and remove
        // the placeholder
        view.dispatch(
          view.state.tr
            .replaceWith(
              pos,
              pos,
              //FIXME: add `width` and `height` to avoid layout shift
              view.state.schema.nodes.image.create({
                src: getUploadUrl(response.key)
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

  function findPlaceholder(state: EditorState, id: any) {
    const decos = placeholderPlugin.getState(state);
    const found = decos?.find(undefined, undefined, (spec) => spec.id == id);
    return found?.[0].from;
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
    }
  });
