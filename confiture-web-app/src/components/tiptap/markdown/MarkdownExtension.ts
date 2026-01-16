import { Extension } from "@tiptap/core";
import { MarkdownPlugin } from "./MarkdownPlugin";

let markdownPlugin: MarkdownPlugin | null = null;

export const PasteMarkdownExtension = Extension.create({
  name: "pasteMarkdown",
  addProseMirrorPlugins() {
    markdownPlugin = new MarkdownPlugin(this.editor);

    return [
      markdownPlugin
    ];
  }
});
