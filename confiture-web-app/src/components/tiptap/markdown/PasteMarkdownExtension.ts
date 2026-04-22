import { Extension } from "@tiptap/core";
import { PasteMarkdownPlugin } from "./PasteMarkdownPlugin";

export const PasteMarkdownExtension = Extension.create({
  name: "pasteMarkdown",
  addProseMirrorPlugins() {
    return [
      new PasteMarkdownPlugin(this.editor)
    ];
  }
});
