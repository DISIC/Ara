import { Editor } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { uniqBy } from "lodash-es";

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

      const markdown = this.realignCommentHeadings(text);

      const json = this.editor.markdown.parse(markdown);

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

  private realignCommentHeadings(markdown: string): string {
    if (!markdown) {
      return markdown;
    }

    const lines: [number, string][] = markdown.split("\n").map((l, i) => [i, l]);

    // Ignore code blocks for following heading level calculation
    // (in case of markdown in code block)
    const linesWithoutCodeBlocks: [number, string][] = [];
    let ignore = false;
    for (let i = 0; i < lines.length; i++) {
      const it = lines[i];
      if (it[1].startsWith("```") && !it[1].slice(3).endsWith("```")) {
        ignore = !ignore;
      }
      if (!ignore) {
        linesWithoutCodeBlocks.push([it[0], it[1].trim()]);
      }
    }

    const headingLines = linesWithoutCodeBlocks.filter(([, l]) =>
      /^#+ ./.test(l)
    );

    const linesWithLevels = headingLines.map(([i, l]) => ({
      index: i,
      line: l,
      level: l.split(" ").at(0)?.length ?? 0
    }));

    const headingLevels = uniqBy(linesWithLevels, (it) => it.level).map(
      (it) => it.level
    );
    headingLevels.sort();

    for (let i = 0; i < headingLevels.length; i++) {
      const originalLevel = headingLevels[i];
      const newLevel = 4 + i;
      if (newLevel <= 6) {
        linesWithLevels
          .filter((it) => it.level === originalLevel)
          .forEach((it) => {
            it.line = it.line.replace(/^#+/, "#".repeat(newLevel));
          });
      } else {
        linesWithLevels
          .filter((it) => it.level === originalLevel)
          .forEach((it) => {
            it.line = it.line.replace(/^#+ /, "".repeat(newLevel));
          });
      }
    }

    linesWithLevels.forEach((it) => {
      lines[it.index][1] = it.line;
    });

    const result = lines.map(([, line]) => line).join("\n");

    return result;
  }
}
