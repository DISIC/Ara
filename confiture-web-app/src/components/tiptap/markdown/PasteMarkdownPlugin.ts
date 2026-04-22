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
    return this.handleDataTransfer(dragEvent.dataTransfer, position.pos, new ClipboardEvent("paste"), true);
  }

  private handleDataTransfer(dataTransfer: DataTransfer, pos: number, clipboardEvent: ClipboardEvent, isDrop?: boolean): boolean {
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
    if (isDrop) {
      this.editor.commands.setTextSelection(pos);
    }

    // Run the editor's paste logic with the given HTML string
    this.isInternalPaste = true;
    this.editor.view.pasteHTML(html, clipboardEvent);
    return true;
  }

  /**
   * Check if the given string looks like Markdown
   *
   * Known limitations:
   * - does not recognise code block formated with 4 leading spaces
   * - probably other edge cases
   *
   * FIXME: use a Markdown parser with "html: false" option when available for
   * Tiptap (e.g. markdown-it).
   * See [Feature Request: Consider an alternate markdown support using markdown-it · ueberdosis/tiptap · Discussion #7489](https://github.com/ueberdosis/tiptap/discussions/7489)
   *
   * @param {string} text String to test
   * @returns {boolean} true if it looks like Markdown, otherwise false
   */
  private looksLikeMarkdown(text: string): boolean {
    return (
      /(?<!<[^>]*)(\*|_)(?!\1).+\1(?![^<]*>)/.test(text) || // Italic or bold (no need to split tests…)
      /^\s{0,3}([-*_])(?:\s*\1){2,}\s*$/m.test(text) || // Horizontal line
      /(?<!<[^>]*)~~.+~~(?![^<]*>)/.test(text) || // Strikethrough
      /^\s{0,3}#{1,6}\s+.+$/m.test(text) || // Heading
      /(?<!<[^>]*)\[.*\]\(.*\s?(?:".*")?\)(?![^<]*>)/.test(text) || // Link
      /^\s{0,3}[-+*]\s+.+$/m.test(text) || // Unordered list
      /^\s{0,3}\d+\.\s+.+$/m.test(text) || // Ordered list
      /^\s{0,3}>\s+.+$/m.test(text) || // Block quotation
      /(?<!<[^>]*)`[^`].+`(?![^<]*>)/.test(text) || // Inline code
      /(?<!<[^>]*)(```|~~~)[\s\S]+?\1(?![^<]*>)/.test(text) || // Code block
      /(?<!<[^>]*)!\[[^\]]*]\([^)]+?(?:\s+"(.*?)")?\)(?![^<]*>)/.test(text) // Image
    );
  }
}
