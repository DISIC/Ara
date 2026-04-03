import { Editor } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { EditorView } from "@tiptap/pm/view";

// Docs :  https://tiptap.dev/docs/editor/markdown/examples

export class PasteMarkdownPlugin extends Plugin {
  private editor: Editor;

  // flag to avoid infinite loop
  private isInternalPaste = false;

  constructor(editor: Editor) {
    super({
      key: new PluginKey("pasteMarkdown"),
      props: {
        handlePaste: (_view, event) =>
          this.handlePaste(editor, event),
        handleDrop: (view, event, _slice, moved) =>
          this.handleDrop(view, event, moved)
      }
    });
    this.editor = editor;
  }

  /**
   * `handlePaste` hook used to interpret pasted Markdown content
   */
  private handlePaste(
    editor: Editor,
    clipboardEvent: ClipboardEvent
  ): boolean {
    const clipboardData = clipboardEvent.clipboardData;
    if (!clipboardData) {
      return false;
    }

    const pos = editor.view.state.selection.from;
    return this.handleDataTransfer(clipboardData, pos, clipboardEvent);
  }

  private handleDrop(
    view: EditorView,
    dragEvent: DragEvent,
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

    // FIXME: Run the editor's drop logic instead of a fake "paste"
    return this.handleDataTransfer(dragEvent.dataTransfer, position.pos, new ClipboardEvent("paste"));
  }

  private handleDataTransfer(dataTransfer: DataTransfer, pos: number, clipboardEvent: ClipboardEvent): boolean {
    if (this.isInternalPaste) {
      this.isInternalPaste = false;
      return false;
    }
    // If cursor or selection is in a code block, do not interpret Markdown
    const nodePos = this.editor.$pos(pos);
    const selectedNode = nodePos.node;
    if (selectedNode?.type.name === "codeBlock") {
      return false;
    }

    const text = dataTransfer.getData("text/plain");

    if (!text) {
      return false;
    }

    const mdManager = this.editor.markdown;

    // Check if text looks like Markdown
    if (!mdManager || !this.looksLikeMarkdown(text)) {
      return false;
    }

    // Parse the Markdown text to HTML
    //
    // **Important note:**
    // Another way to do this could be:
    // ```
    // generateHTML(mdManager.parse(text), extensions)
    // ```
    // See:
    // - [Markdown Editor API | Tiptap Editor Docs](https://tiptap.dev/docs/editor/markdown/api/editor#editormarkdown)
    // - [`generateHTML`](https://tiptap.dev/docs/editor/api/utilities/html#generating-html-from-json)
    //
    // But here we don't want to use the schema defined by all extensions
    // So we use the marked instance directly:
    const html = mdManager.instance.parse(text) as string;

    // Move selection at given position and paste the HTML content
    this.editor.commands.setTextSelection(pos);

    // Run the editor's paste logic with the given HTML string
    this.isInternalPaste = true;
    this.editor.view.pasteHTML(html, clipboardEvent);
    return true;
  }

  private looksLikeMarkdown(text: string): boolean {
    // Simple heuristic: check for Markdown syntax
    return (
      /^#{1,6}\s/.test(text) || // Headings
      /\*\*[^*]+\*\*/.test(text) || // Bold
      /[*_][^*_]+[*_]/.test(text) || // Italic with * or _
      /\[.+\]\(.+\)/.test(text) || // Links
      /<[^>\s]+>/.test(text) || // Autolinks (any <link>)
      /^[-*+]\s/.test(text) || // Lists
      /^>\s/.test(text) || // Blockquote
      /^(```|~~~)/.test(text) // Code blocks
    );
  }
}
