import { Slice } from "@tiptap/pm/model";
import { EditorState, Plugin, PluginKey, Selection, Transaction } from "@tiptap/pm/state";
import { canSplit } from "@tiptap/pm/transform";
import { Decoration, EditorView } from "@tiptap/pm/view";
import ky from "ky";
import { useNotifications } from "../../../composables/useNotifications";
import { FILE_SIZE_LIMIT, FileErrorMessage, MAX_UPLOAD_FILES_COUNT } from "../../../enums";
import { createFileFromUrl, getUploadUrl, handleFileUploadError } from "../../../utils";
import { PlaceholderPlugin } from "./PlaceholderPlugin";

interface ImageImportPluginOptions {
  onImageUploadComplete: ((url: string) => void) | null;
}

/**
 * Handles image import inside editor:
 *
 * Functionnalities:
 * - 3 ways to insert an image in the editor:
 *   - "drag and drop" (local file + *permissive* external URL)
 *   - "copy / paste" (local file + *permissive* external URL)
 *   - via an "Insert" button (local file only)
 * - the imported image is uploaded to a server
 *   (see backend API "/api/audits/editor/images")
 * - a preview is shown as a placeholder (thanks to the `PlaceholderPlugin`)
 * - on upload success, an image node is added to the editor content,
 *   replacing the placeholder with a smooth visual transition
 * - errors are notified to user:
 *   - local errors:
 *      - UPLOAD_MAX_FILES_COUNT
 *      - UPLOAD_FORMAT
 *      - UPLOAD_SIZE
 *      - UNKNOWN_ERROR
 *   - server errors (see utils#handleFileUploadError):
 *      - UPLOAD_TIMEOUT
 *      - UPLOAD_FORMAT
 *      - UPLOAD_SIZE
 *      - UNKNOWN_ERROR
 *
 * Limitations:
 * - prevents multiple imports at the same time (only one by one)
 * - prevents drag and drop from external websites that block it with CORS
 * - only one image on the same lin (images are block nodes, not inline)
 *
 * Ideas for the future:
 * - accept all kinds of formats (ex: PDF)
 * - allow multiple files at the same time
 * - add a plugin to handle image resizing
 */
export class ImageImportPlugin extends Plugin {
  constructor(private options: ImageImportPluginOptions, private placeholderPlugin: PlaceholderPlugin) {
    super({
      key: new PluginKey("handleImageImport"),
      props: {
        handleDrop: (view, event, slice, moved) =>
          this.handleDrop(view, event, slice, moved),
        handlePaste: (view, event, slice) =>
          this.handlePaste(view, event, slice)
      }
    });
  }

  private notify = useNotifications();

  /**
   * handleDrop: called when something is dropped on the editor.
   * @returns true if given drag event is handled, otherwise false
   */
  private handleDrop(
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

    return this.handleDataTransfer(
      view,
      dragEvent.dataTransfer,
      position.pos
    );
  }

  /**
   * handlePaste: used to override the behavior of pasting in the editor.
   *
   * Note: known bug on Firefox: [864052 - clipboardData only supports pasting one file](https://bugzilla.mozilla.org/show_bug.cgi?id=864052)
   *
   * @returns true if given clipboard event is handled, otherwise false
   */
  private handlePaste(
    view: EditorView,
    clipboardEvent: ClipboardEvent,
    _slice: Slice | undefined
  ): boolean {
    if (!clipboardEvent.clipboardData) {
      return false;
    }

    const pos = view.state.selection.from;
    return this.handleDataTransfer(
      view,
      clipboardEvent.clipboardData,
      pos,
      {
        replaceSelection: true
      }
    );
  }

  /**
   * handleDataTransfer: called by handleDrop and handlePaste
   * @returns true if given dataTransfer is a set of files or URIs, otherwise false
   */
  private handleDataTransfer(
    view: EditorView,
    dataTransfer: DataTransfer,
    pos: number,
    options?: { replaceSelection: boolean }
  ): boolean {
    // Browser may pass a list of files (e.g. in Chrome)
    if (dataTransfer.files?.length > 0) {
      // Actually do something with the files in dataTransfer
      this.handleImagesImport(view, pos, Array.from(dataTransfer.files), options);
      return true;
    }

    // Or browser may pass a list of URIs
    const uriItems = Array.from(dataTransfer.items).filter((item) => {
      return (item.kind === "string" && item.type.match("^text/uri-list"));
    });
    if (uriItems.length > 0) {
      // Handle image imports asynchronously
      this.getFilesFromUriItems(uriItems, (files) => {
        if (files.length < 1) {
          this.notify("error", undefined, FileErrorMessage.FETCH_ERROR);
        }
        this.handleImagesImport(view, pos, files, options);
      });
      return true;
    }

    // Tiptap will handle other formats (e.g. HTML text)
    return false;
  }

  /**
   * Handles multiple images import.
   *
   * Called by handleDataTransfer or after selecting local files
   * (e.g. with the "Import image" button, see ImageUploadExtension#insertFilesAtSelection
   *
   * Note: as we currently do not support multiple imports, this function
   *       is never called with more than 1 file for the moment.
   */
  public handleImagesImport(
    view: EditorView,
    pos: number,
    files: File[],
    options?: { replaceSelection: boolean }
  ): void {
    if (files.length > MAX_UPLOAD_FILES_COUNT) {
      this.notify("error", undefined, FileErrorMessage.UPLOAD_MAX_FILES_COUNT);
      return;
    }
    for (let i = 0, il = files.length, file; i < il; i++) {
      file = files[i];
      if (file) {
        this.handleImageImport(view, pos, file, options);
      }
    }
    return;
  }

  /**
   * Handles a single image import
   *
   * STEP 1:
   * Creates an image placeholder (ProseMirror widget Decoration) where the
   * image is inserted. This placeholder `src` looks like
   * "blob:https://ara.numerique.gouv.fr/3f9e8516-48fc-4099-ba3f-ea23b5b1fd95"
   * It’s a blob URL corresponding to the local file provided by the browser
   * (dragged and dropped, or pasted, or inserted from system)
   * See [blob: URLs - URIs | MDN](https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Schemes/blob)
   *
   * STEP 2:
   * See #uploadAndReplacePlaceHolder
   *
   * Fails (and notify with an error) when:
   * 1. the given file is not an image
   * 2. its size exceeds the maximum size allowed (see FILE_SIZE_LIMIT)
   * 3. another error is raised (see [Image loading errors | MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img#image_loading_errors))
   */
  private handleImageImport(
    view: EditorView,
    pos: number,
    file: File,
    options?: { replaceSelection: boolean }
  ): void {
    // Check image format
    if (!file.type.startsWith("image")) {
      this.notify("error", undefined, FileErrorMessage.UPLOAD_FORMAT);
      return;
    }

    // Check max size
    if (file.size > FILE_SIZE_LIMIT) {
      this.notify("error", undefined, FileErrorMessage.UPLOAD_SIZE);
      return;
    }

    // A fresh object to act as the ID for this upload
    const id = {};

    // Create a placeholder element with the blob URL
    const _URL = window.URL || window.webkitURL;
    const localURL = _URL.createObjectURL(file);
    const element = document.createElement("img");

    element.onerror = () => {
      // Error on the placeholder image. Should not happen…
      // See [Image loading errors | MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img#image_loading_errors)
      this.notify("error", undefined, FileErrorMessage.UNKNOWN_ERROR);
    };
    element.onload = () => {
      element.setAttribute("width", element.width.toString());
      element.setAttribute("height", element.height.toString());
      const state: EditorState = view.state;
      const tr: Transaction = state.tr;

      // Image may replace current selected content
      if (options?.replaceSelection && !state.selection.empty) {
        tr.deleteSelection();

        // Delete the paragraph if it becomes empty
        if (tr.doc.resolve(pos).parent.textContent === "") {
          tr.deleteRange(pos - 1, pos + 1);
        }
      }

      // Image may split current content
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

      // Add a placeholder within the current transaction
      tr.setMeta(this.placeholderPlugin, {
        add: { id, container: null, element, pos }
      });

      // Updates the transaction's current selection to a valid position
      // (nearest position forward)
      tr.setSelection(Selection.near(tr.doc.resolve(pos), 1));
      view.dispatch(tr);
      this.uploadAndReplacePlaceholder(view, file, id, element, localURL);

      // Focus editor view in case it was not already focused. Can happen:
      // - when inserting the image with the "Insert image" button"
      // - or when dropping the image while the editor is not focused
      view.focus();
    };
    element.src = localURL;
  }

  /**
   * Uploads the given image file and then:
   * - if the upload is successful:
   *   1. calls onImageUploadComplete hook
   *   3. if the placeholder has been deleted in the meantime, stops here
   *   2. otherwise replaces the placeholder with an actual image node
   *      rendered as a TiptapImage node view (smooth CSS transition)
   * - otherwise if upload fails:
   *   1. cleans up the possible placeholder.
   *   2. notifies with an error
   */
  private uploadAndReplacePlaceholder(
    view: EditorView,
    file: File,
    id: any,
    element: HTMLImageElement,
    localURL: string
  ): void {
    this.uploadImage(file).then(
      (imgUrl: string) => {
        this.options.onImageUploadComplete?.(file.name);

        const placeholder = this.findPlaceholderDecoration(view.state, id);
        const pos: number | undefined = placeholder?.from;

        // If the content around the placeholder has been deleted,
        // do not insert the image
        if (pos === undefined) {
          return;
        }

        // Otherwise, replace the placeholder with a new image node
        // Tip: the local blob URL is used as a background image
        //      to ease the transition
        const state = view.state;
        const tr = state.tr;
        const node = state.schema.nodes.image.create({
          src: imgUrl,
          alt: file.name === "external" ? "Image insérée" : file.name,
          width: placeholder?.spec.width,
          height: placeholder?.spec.height,
          localURL
        });
        tr.replaceWith(pos, pos, node);
        tr.setMeta(this.placeholderPlugin, { element, remove: { id } });

        view.dispatch(tr);
      },
      async (reason: Error) => {
        // On failure, clean up the placeholder
        view.dispatch(
          view.state.tr.setMeta(this.placeholderPlugin, { element, remove: { id } })
        );
        this.notify("error", undefined, await handleFileUploadError(reason));
      }
    );
  }

  /**
   * Function to upload an image file inside the editor
   * @returns a promise that resolves with the URL of the uploaded image
   */
  private async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    // To handle non-ascii characters, we encode the filename here and decode it on the back
    formData.set("file", file, encodeURI(file.name));

    const imageUploadKey = (await ky
      .post(`/api/audits/editor/images`, { body: formData, timeout: 15_000 })
      .text()) as string;

    const url = getUploadUrl(imageUploadKey);

    return url;
  }

  private getFilesFromUriItems(
    uriItems: DataTransferItem[],
    onComplete: (files: File[]) => void
  ) {
    const getFilePromises = uriItems.map(
      (uriItem) =>
        new Promise<File | null>((resolve) => {
          uriItem.getAsString((url) => {
            createFileFromUrl(url)
              .then((file) => {
                resolve(file ?? null);
              })
              .catch((err) => {
                console.error(`Error creating file from URL: ${url}`, err);
                resolve(null);
              });
          });
        })
    );

    Promise.all(getFilePromises).then((results) => {
      // Filter out nulls to ensure passing only File objects in callback
      const files = results.filter((file): file is File => file !== null);
      onComplete(files);
    });
  }

  /**
   * Finds the given placeholder (by id) within the given editor state.
   * @returns the placeholder (a ProseMirror decoration) or undefined if not found
   */
  private findPlaceholderDecoration(
    state: EditorState,
    id: any
  ): Decoration | undefined {
    const decos = this.placeholderPlugin.getState(state);
    const found = decos?.find(undefined, undefined, (spec: any) => spec.id == id);
    return found?.[0];
  }
}
