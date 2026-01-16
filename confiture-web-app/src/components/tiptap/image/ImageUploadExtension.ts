import { Editor, Extension } from "@tiptap/core";
import { EditorState } from "@tiptap/pm/state";
import { EditorView } from "@tiptap/pm/view";
import { ImageImportPlugin } from "./ImageImportPlugin";
import { PlaceholderPlugin } from "./PlaceholderPlugin";

let imageImportPlugin: ImageImportPlugin | null = null;
let placeholderPlugin: PlaceholderPlugin | null = null;

/**
 * Extension ImageUploadExtension
 *
 * Tiptap extension handling images “drag and drop” and upload
 * Adds 2 custom ProseMirror plugins (@see https://tiptap.dev/docs/editor/extensions/custom-extensions/extend-existing#prosemirror-plugins-advanced):
 * - HandleDropPlugin
 * - placeholderPlugin
 * Modifies schema: adds a disableDropCursor property to Nodes spec to control
 * the showing of a drop cursor inside them (only shows horizontal cursors)
 * @see https://github.com/ProseMirror/prosemirror-dropcursor
 */
export const ImageUploadExtension =
  Extension.create<{ onImageUploadComplete: ((fileName: string) => void) | null }>({
    name: "imageUpload",
    addProseMirrorPlugins() {
      placeholderPlugin = new PlaceholderPlugin();
      imageImportPlugin = new ImageImportPlugin(this.options, placeholderPlugin);
      return [
        imageImportPlugin,
        placeholderPlugin
      ];
    },
    addOptions() {
      return {
        onImageUploadComplete: null
      };
    }
  });

/**
 * Insert files at current cursor position, or replacing current selection.
 * See [Selection - ProseMirror Reference manual](https://prosemirror.net/docs/ref/#state.Selection)
 */
export function insertFilesAtSelection(
  editor: Editor,
  files: File[]
) {
  const view: EditorView = editor.view;
  const state: EditorState = view.state;
  const pos = state.selection.from;

  return imageImportPlugin?.handleImagesImport(view, pos, files, {
    replaceSelection: true
  });
}
