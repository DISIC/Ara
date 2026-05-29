import { Markdown } from "@tiptap/markdown";

export const MarkdownExtension =
  Markdown.configure({
    markedOptions: {
      async: false
    }
  });
