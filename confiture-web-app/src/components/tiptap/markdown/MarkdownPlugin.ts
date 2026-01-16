import { Editor } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";

// Docs :  https://tiptap.dev/docs/editor/markdown/examples

export class MarkdownPlugin extends Plugin {
  private editor: Editor;

  constructor(editor: Editor) {
    super({
      key: new PluginKey("pasteMarkdown"),
      props: {
        handlePaste: (view, event) =>
          this.handlePaste(editor, event)
      }
    });
    this.editor = editor;
  }

  private handlePaste(
    editor: Editor,
    clipboardEvent: ClipboardEvent
  ): boolean {
    if (!clipboardEvent.clipboardData) {
      return false;
    }

    const text = clipboardEvent.clipboardData.getData("text/plain");

    if (text && this.looksLikeMarkdown(text)) {
      if (!this.editor || !this.editor.markdown) {
        return false;
      }

      const json = this.editor.markdown.parse(text);

      // Mapping headings h1, h2, h3 to h4, h5, h6
      if (json.content?.some(x => x.type === "heading")) {
        json.content
          .filter((x) => x.type === "heading")
          .forEach((item) => this.remapHeadingLevels(item));
      }

      editor.commands.insertContent(json);
      return true;
    }

    return false;
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

  private remapHeadingLevels(node: any): void {
    if (node.attrs) {
      const mappedLevel = this.mapHeadingLevel(node.attrs.level);
      if (mappedLevel) {
        node.attrs = { ...node.attrs, level: mappedLevel };
      }
    }
  }

  private mapHeadingLevel(level?: number): number | null {
    if (level === 1) return 4;
    if (level === 2) return 5;
    if (level === 3) return 6;
    return level ?? null;
  }
}
