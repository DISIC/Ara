import { Editor, generateHTML, generateJSON, generateText } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { uniqBy } from "lodash-es";
import { displayedHeadings, getTiptapEditorExtensions } from "../tiptap-extensions";

// Docs :  https://tiptap.dev/docs/editor/markdown/examples

export class MarkdownPlugin extends Plugin {
  private editor: Editor;

  constructor(editor: Editor) {
    super({
      key: new PluginKey("pasteMarkdown"),
      props: {
        handlePaste: (_view, event) =>
          this.handlePaste(editor, event)
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

    // If cursor or selection is in a code block, do not interpret Markdown
    const selectedNode = editor.state.selection.$from.parent;
    if (selectedNode.type.name === "codeBlock") {
      return false;
    }

    // Get plain text from clipboard (maybe Markdown?)
    const text = clipboardData.getData("text/plain");

    const mdManager = this.editor.markdown;

    if (!text || !mdManager) {
      return false;
    }

    // Parse Markdown into a Tiptap JSON document. The Markdown manager
    // interprets Markdown and creates nodes and marks accordingly
    // Note: it does **not** check the editor schema
    const jsonContent = mdManager.parse(text);
    if (!jsonContent) {
      return false;
    }

    const extensions = getTiptapEditorExtensions();

    // Generate raw text from the Tiptap JSON document using the editor extensions
    // for the schema: only creates allowed nodes and marks
    const textFromJson = generateText(jsonContent, extensions);

    // HACK
    // In order to detect if content is Markdown, we compare text and
    // textFromJson. If both are different, it’s not Markdown!
    //
    // ✅ Markdown example:
    // text:         "> First line of blockquote  \n> Second line"
    // textFromJson: "\n\nFirst line of blockquote\nSecond line"
    //
    // ❌ Not Markdown example:
    // text:         "Hello! Nice to meet you."
    // textFromJson: "Hello! Nice to meet you."
    if (text === textFromJson) {
      return false;
    }

    const realignedJson = mdManager.parse(this.realignHeadingLevels(text));

    // HACK
    // We want the content to fit the editor schema. For example, no mark
    // (bold, italic, …) is allowed inside a Heading node (h4, h5, …)
    // After retrieving Tiptap JSON document from Markdown plain text,
    // converting it to HTML before parsing it again to JSON allows us to use
    // [DOMParser.rules](https://prosemirror.net/docs/ref/#model.DOMParser.rules)
    //
    // TL;DR: “Mardown → JSON → HTML → JSON” to fit the editor schema
    const html = generateHTML(realignedJson, extensions);
    const finalJson = generateJSON(html, extensions);

    editor.commands.insertContent(finalJson);
    return true;
  }

  /**
   * Realign heading levels
   *
   * Examples for displayedHeadings = [4, 5, 6]:
   * - h1, h2, h3     → h4, h5, h6
   * - h2, h3, h4     → h4, h5, h6
   * - h5, h6         → h4, h5
   * - h3, h4, h5, h6 → h4, h5, h6, p
   */
  private realignHeadingLevels(markdown: string): string {
    const lines: [number, string][] = markdown.split("\n").map((l, i) => [i, l]);

    // Ignore code blocks for following heading level calculation
    // (in case of Markdown in code block)
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
      const newLevel = displayedHeadings[0] + i;
      if (newLevel <= displayedHeadings[displayedHeadings.length - 1]) {
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
