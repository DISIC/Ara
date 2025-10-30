import { Editor, Extension } from "@tiptap/core";
import { Slice } from "@tiptap/pm/model";
import { EditorState, Plugin, Selection, Transaction } from "@tiptap/pm/state";
import { canSplit } from "@tiptap/pm/transform";
import { Decoration, DecorationSet, EditorView } from "@tiptap/pm/view";

import ky from "ky";
import { useNotifications } from "../../composables/useNotifications";
import { FileErrorMessage } from "../../enums";
import { getUploadUrl, handleFileUploadError } from "../../utils";

const FILE_SIZE_LIMIT = 2_000_000;

/**
 * Function to upload a file inside the editor
 *
 * @param file File to upload
 * @returns a promise to the URL of the uploaded image
 */
async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  // To handle non-ascii characters, we encode the filename here and decode it on the back
  formData.set("file", file, encodeURI(file.name));

  const imageUploadKey = (await ky
    .post(`/api/audits/editor/images`, { body: formData, timeout: 15_000 })
    .text()) as string;

  const url = getUploadUrl(imageUploadKey);

  return url;
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
      const trDoc = tr.doc;
      // Adjust decoration positions to changes made by the transaction
      set = set.map(tr.mapping, trDoc);
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
        set = set.add(trDoc, [deco]);
      } else if (action && action.remove) {
        set = set.remove(
          set.find(undefined, undefined, (spec) => spec.id == action.remove.id)
        );

        action.element.remove();
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
 * HandleFileImport plugin
 *
 * Handles "drag and drop" and "copy / paste" inside editor, then upload to server:
 * - multiple image files
 * - dataURL
 * - external image from URL (⚠️ CORS)
 */
const HandleFileImportPlugin = () => {
  return new Plugin({
    props: {
      /**
       * handleDrop: called when something is dropped on the editor.
       * @returns true if event is handled, otherwise false
       */
      handleDrop(
        this: Plugin<any>,
        view: EditorView,
        dragEvent: DragEvent,
        _slice: Slice,
        moved: boolean
      ): boolean {
        if (moved || !dragEvent.dataTransfer || !dragEvent.dataTransfer.files) {
          return false;
        }
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

        return handleDataTransfer(
          view,
          dragEvent.dataTransfer,
          position.pos
        );
      },

      /**
       * handlePaste: called when something is dropped on the editor.
       *
       * @param {Plugin<any>} this
       * @param {EditorView} view
       * @param {ClipboardEvent} clipboardEvent
       * @returns true if event is handled, otherwise false
       */
      handlePaste(
        this: Plugin<any>,
        view: EditorView,
        clipboardEvent: ClipboardEvent
      ): boolean {
        if (
          !clipboardEvent.clipboardData ||
          !(clipboardEvent.clipboardData?.files?.length > 0)
        ) {
          return false;
        }

        const pos = view.state.selection.from;
        return handleDataTransfer(
          view,
          clipboardEvent.clipboardData,
          pos,
          {
            replaceSelection: true
          }
        );
      }
    }
  });
};

/**
 * handleDataTransfer: called for both drop and paste.
 * @returns true if event is handled, otherwise false
 */
function handleDataTransfer(
  view: EditorView,
  dataTransfer: DataTransfer,
  pos: number,
  options?: { replaceSelection: boolean }
) {
  if (dataTransfer.files.length === 0) {
    // Handle a single URL (ex: when an external image is dragged from another window)
    // TODO: multiple URLs
    // See: "text/uri-list" and
    // https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/Recommended_drag_types
    const url = dataTransfer.getData("URL");
    if (url) {
      createFileFromImageUrl(url).then((file) => {
        if (file) {
          handleFileImport(view, pos, file, options);
        }
      });
      return true;
    } else {
      return false;
    }
  }

  // Handle multiple files
  return handleFilesImport(view, pos, dataTransfer.files, options);
}

/**
 * Handles multiple files import (drop or paste)
 * @returns true or false if:
 *   - files array is empty
 *   - any file is not dropped inside of the editor (should not happen)
 */
function handleFilesImport(
  view: EditorView,
  pos: number,
  files: FileList,
  options?: { replaceSelection: boolean }
): boolean {
  // FIXME: sometimes placeholders order differs from final images order
  for (let i = 0, il = files.length, file: File; i < il; i++) {
    file = files.item(i)!;
    if (!handleFileImport(view, pos, file, options)) {
      return false;
    }
  }
  return true;
}

/**
 * Handles file import (drop or paste)
 *
 * @returns true or false if file is not dropped inside of the editor (should not happen)
 */
function handleFileImport(
  view: EditorView,
  pos: number,
  file: File,
  options?: { replaceSelection: boolean }
): boolean {
  const notify = useNotifications();

  if (!file.type.startsWith("image")) {
    notify("error", undefined, FileErrorMessage.UPLOAD_FORMAT);
    return true;
  }

  if (file.size > FILE_SIZE_LIMIT) {
    notify("error", undefined, FileErrorMessage.UPLOAD_SIZE);
    return true;
  }

  // A fresh object to act as the ID for this upload
  const id = {};

  const _URL = window.URL || window.webkitURL;
  const localURL = _URL.createObjectURL(file);
  const element = document.createElement("img");

  element.onerror = () => {
    notify("error", undefined, FileErrorMessage.UPLOAD_FORMAT);
  };
  element.onload = () => {
    URL.revokeObjectURL(element.src);
    element.setAttribute("width", element.width.toString());
    element.setAttribute("height", element.height.toString());
    const state: EditorState = view.state;
    const tr: Transaction = state.tr;

    if (options?.replaceSelection && !state.selection.empty) {
      tr.deleteSelection();

      // Delete the paragraph if it becomes empty
      if (tr.doc.resolve(pos).parent.textContent === "") {
        tr.deleteRange(pos - 1, pos + 1);
      }
    }

    const $pos = tr.doc.resolve(pos);
    if (canSplit(state.tr.doc, pos)) {
      if (pos === $pos.start()) {
        pos -= 1;
      } else {
        if (pos < $pos.end()) {
          tr.split(pos);
        }
        pos += 1;
      }
    }
    tr.setMeta(PlaceholderPlugin, {
      add: { id, container: null, element, pos }
    });
    tr.setSelection(Selection.near(tr.doc.resolve(pos), 1));
    view.dispatch(tr);
    uploadAndReplacePlaceholder(view, file, id, element);
    view.focus();
  };
  element.src = localURL;

  return true;
}

/**
 * Uploads and then replaces the placeholder
 */
function uploadAndReplacePlaceholder(
  view: EditorView,
  file: File,
  id: any,
  element: HTMLImageElement | HTMLVideoElement
) {
  const notify = useNotifications();

  uploadImage(file).then(
    (imgUrl: string) => {
      const placeholder = findPlaceholderDecoration(view.state, id);
      const pos: number | undefined = placeholder?.from;

      // If the content around the placeholder has been deleted,
      // do not insert the image
      if (pos === undefined) {
        return;
      }

      // Otherwise, insert it at the placeholder's position, and remove
      // the placeholder
      const state = view.state;
      const tr = state.tr;
      const node = state.schema.nodes.image.create({
        src: imgUrl,
        alt: file.name === "external" ? "Image insérée" : file.name,
        width: placeholder?.spec.width,
        height: placeholder?.spec.height
      });
      tr.replaceWith(pos, pos, node);
      tr.setMeta(PlaceholderPlugin, { element, remove: { id } });

      view.dispatch(tr);

      const imgElement = view.nodeDOM(pos) as HTMLImageElement;

      // Announce upload success to screen readers
      const closest = imgElement.closest(".fr-collapse");
      const message = closest?.querySelector("[data-image-success-message]");
      if (message) {
        // "external" is the file name in Firefox when using drag-and-drop
        // directly from an external website (with permissive CORS)
        message.textContent = file.name === "external" ?
          "L’image a été correctement insérée"
          : `L’image « ${file.name} » a été correctement insérée`;
        setTimeout(() => {
          message.textContent = "";
        }, 3000);
      }
    },
    async (reason: Error) => {
      // On failure, just clean up the placeholder
      view.dispatch(
        view.state.tr.setMeta(PlaceholderPlugin, { element, remove: { id } })
      );
      notify("error", undefined, await handleFileUploadError(reason));
    }
  );
}

/**
 * Finds the given placeholder (by id) within the given editor state.
 *
 * @returns the placeholder (a ProseMirror decoration)
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
 * @returns {Promise<File | null>} the created File or null if any error
 */
function createFileFromImageUrl(url: string): Promise<File | null> {
  const notify = useNotifications();

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
      notify("error", undefined, FileErrorMessage.FETCH_ERROR);
      return null;
    });
}

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
  Extension.create({
    name: "imageUpload",
    addProseMirrorPlugins() {
      return [
        HandleFileImportPlugin(),
        PlaceholderPlugin
      ];
    }
  });

export function insertFilesAtSelection(
  editor: Editor,
  files: FileList
) {
  const view: EditorView = editor.view;
  const state: EditorState = view.state;
  const tr: Transaction = state.tr;
  const pos = state.selection.from;

  const notify = useNotifications();

  if (files.length > 5) {
    notify("error", undefined, FileErrorMessage.UPLAOD_MAX_FILES_COUNT);
    return;
  }

  view.focus();
  tr.deleteSelection();

  return handleFilesImport(view, pos, files, {
    replaceSelection: true
  });
}
