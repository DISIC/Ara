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
 * Placeholder plugin
 *
 * The placeholder is an image blob (local to browser), with 50% opacity.
 * Within ProseMirror it’s a Decoration.
 */
const PlaceholderPlugin = new Plugin({
  state: {
    init() {
      return DecorationSet.empty;
    },
    apply(tr, set) {
      // Adjust decoration positions to changes made by the transaction
      set = set.map(tr.mapping, tr.doc);
      // See if the transaction adds or removes any placeholders
      const action = tr.getMeta(PlaceholderPlugin);
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

/**
 * HandleDrop plugin
 *
 * Handles drag and drop inside editor:
 * - multiple image files
 * - dataURL
 * - external image from URL (⚠️ CORS)
 */
const HandleDropPlugin = (options: ImageUploadTiptapExtensionOptions) => {
  const { uniqueId } = options;
  return new Plugin({
    props: {
      /**
       * handleDrop: called when something is dropped on the editor.
       *
       * @param {Plugin<any>} this
       * @param {EditorView} view
       * @param {DragEvent} dragEvent
       * @param {Slice} slice
       * @param {boolean} moved
       * @returns true if event is handled, otherwise false
       */
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
          // Handle a single URL (ex: when an external image is dragged from another window)
          // TODO multiple URLs
          // See: "text/uri-list" and
          // https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/Recommended_drag_types
          const url = dragEvent.dataTransfer.getData("URL");
          if (url) {
            createFileFromImageUrl(url).then((file) => {
              if (file) {
                handleFileDrop(view, dragEvent, file);
              }
            });
          }
          return true;
        }

        // Handle multiple files
        // FIXME: sometimes placeholders order differs from final images order
        const files: FileList = dragEvent.dataTransfer.files;
        for (let i = 0, il = files.length, file: File; i < il; i++) {
          file = files.item(i)!;
          if (!handleFileDrop(view, dragEvent, file)) {
            return false;
          }
        }

        return true;
      }
    }
  });

  /**
   * Handles file drop
   *
   * @param {EditorView} view
   * @param {DragEvent} dragEvent
   * @param {File} file
   * @returns {boolean} true or false if file is not dropped inside of the editor (should not happen)
   */
  function handleFileDrop(
    view: EditorView,
    dragEvent: DragEvent,
    file: File
  ): boolean {
    const position = view.posAtCoords({
      left: dragEvent.clientX,
      top: dragEvent.clientY
    });
    if (!position) {
      console.warn(
        `the given coordinates aren't inside of the editor: {${dragEvent.clientX}, ${dragEvent.clientY}}`
      );
      return false;
    }

    if (file.size > 2000000) {
      //FIXME: use a notification
      window.alert(FileErrorMessage.UPLOAD_SIZE);
      return true;
    }

    // A fresh object to act as the ID for this upload
    const id = {};

    // If image is being dropped *inside* a node,
    // move it to next "gap", between 2 nodes
    let pos = position.pos;
    if (isPosInsideInlineContent(view, pos)) {
      pos = view.state.doc.resolve(position.pos).end() + 1;
    }

    const _URL = window.URL || window.webkitURL;
    const localURL = _URL.createObjectURL(file);
    let element: HTMLImageElement | HTMLVideoElement;
    if (file.type.startsWith("image")) {
      element = document.createElement("img");
      element.onerror = () => {
        //FIXME: use a notification
        window.alert(FileErrorMessage.UPLOAD_FORMAT);
      };
      element.onload = () => {
        URL.revokeObjectURL(element.src);
        element.setAttribute("width", element.width.toString());
        element.setAttribute("height", element.height.toString());
        const { tr } = view.state;
        tr.setMeta(PlaceholderPlugin, {
          add: { id, element, pos }
        });
        view.dispatch(tr);

        uploadAndReplacePlaceholder(view, file, id);
      };
      element.src = localURL;
    } else if (file.type.startsWith("video")) {
      //FIXME: Handle videos
      // element = document.createElement("video");
      // …
      //FIXME: use a notification
      window.alert(FileErrorMessage.UPLOAD_FORMAT);
    } else {
      //FIXME: use a notification
      window.alert(FileErrorMessage.UPLOAD_FORMAT);
    }

    return true;
  }

  /**
   * Uploads and then replaces the placeholder
   *
   * @param {EditorView} view
   * @param {DragEvent} dragEvent
   * @param {File} file
   */
  function uploadAndReplacePlaceholder(view: EditorView, file: File, id: any) {
    const auditStore = useAuditStore();
    auditStore.uploadAuditFile(uniqueId, file, FileDisplay.EDITOR).then(
      (response: AuditFile) => {
        const placeholder = findPlaceholderDecoration(view.state, id);
        const pos: number | undefined = placeholder?.from;

        // If the content around the placeholder has been deleted, drop
        // the image
        if (pos === undefined) {
          // TODO remove image from server
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
            .setMeta(PlaceholderPlugin, { remove: { id } })
        );
      },
      async (reason: any) => {
        // On failure, just clean up the placeholder
        view.dispatch(
          view.state.tr.setMeta(PlaceholderPlugin, { remove: { id } })
        );
        //FIXME: use a notification
        window.alert(await handleFileUploadError(reason));
      }
    );
  }

  /**
   * Finds the given placeholder (by id) within the given editor state.
   *
   * @param {EditorState} state
   * @param {any} id
   * @returns {Decoration} the placeholder (a ProseMirror decoration)
   */
  function findPlaceholderDecoration(
    state: EditorState,
    id: any
  ): Decoration | undefined {
    const decos = PlaceholderPlugin.getState(state);
    const found = decos?.find(undefined, undefined, (spec) => spec.id == id);
    return found?.[0];
  }

  /**
   * Creates a File object from a given URL
   *
   * @param {string} url
   * @returns {Promise<File | null>} the created File or null if any error
   */
  function createFileFromImageUrl(url: string): Promise<File | null> {
    let mimeType: string | undefined = undefined;
    return fetch(url)
      .then((res: Response) => {
        mimeType = res.headers.get("content-type") || undefined;
        return res.arrayBuffer();
      })
      .then((buf: ArrayBuffer) => {
        return new File([buf], "external", { type: mimeType });
      })
      .catch(() => {
        window.alert(FileErrorMessage.FETCH_ERROR);
        return null;
      });
  }
};

/**
 * Extension ImageUploadTiptapExtension
 *
 * Tiptap extension handling images “drag and drop” and upload
 * Adds 2 custom ProseMirror plugins (@see https://tiptap.dev/docs/editor/extensions/custom-extensions/extend-existing#prosemirror-plugins-advanced):
 * - HandleDropPlugin
 * - PlaceholderPlugin
 * Modifies schema: adds a disableDropCursor property to Nodes spec to control
 * the showing of a drop cursor inside them (only shows horizontal cursors)
 * @see https://github.com/ProseMirror/prosemirror-dropcursor
 */
export const ImageUploadTiptapExtension =
  Extension.create<ImageUploadTiptapExtensionOptions>({
    name: "imageUpload",
    addProseMirrorPlugins() {
      return [
        HandleDropPlugin({ uniqueId: this.options.uniqueId }),
        PlaceholderPlugin
      ];
    },
    extendNodeSchema() {
      return {
        disableDropCursor: (
          view: EditorView,
          position: { pos: number; inside: number }
        ) => {
          return isPosInsideInlineContent(view, position.pos);
        }
      };
    }
  });

/**
 * Tells if the given position is inside inline content
 * (meaning the drop cursor would be vertical)
 * @see prosemirror-dropcursor extension
 *
 * @param {EditorView} view
 * @param {number} pos
 * @returns {boolean} true if position is inside inline content, otherwise false
 */
function isPosInsideInlineContent(view: EditorView, pos: number): boolean {
  if (!pos) {
    return false;
  }
  const $pos = view.state.doc.resolve(pos);
  return $pos.parent.inlineContent;
}
