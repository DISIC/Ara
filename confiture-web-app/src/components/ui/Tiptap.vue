<script lang="ts" setup>
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Heading from "@tiptap/extension-heading";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import Typography from "@tiptap/extension-typography";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/vue-3";
import css from "highlight.js/lib/languages/css";
import js from "highlight.js/lib/languages/javascript";
import ts from "highlight.js/lib/languages/typescript";
import html from "highlight.js/lib/languages/xml";
// load common languages
import { common, createLowlight } from "lowlight";
import { Markdown } from "tiptap-markdown";

// create a lowlight instance
const lowlight = createLowlight(common);

// you can also register languages
lowlight.register("html", html);
lowlight.register("css", css);
lowlight.register("js", js);
lowlight.register("ts", ts);

const props = defineProps(["content"]);
const emit = defineEmits(["update:content"]);

function getContent() {
  let jsonContent;
  try {
    jsonContent = JSON.parse(props.content);
  } catch {
    jsonContent = props.content;
  }

  return jsonContent;
}

const editor = useEditor({
  content: getContent(),
  extensions: [
    CodeBlockLowlight.configure({ lowlight, defaultLanguage: "html" }),
    Highlight,
    Heading.configure({
      levels: [2, 3, 4, 5, 6]
    }),
    Link,
    Markdown,
    StarterKit.configure({
      codeBlock: false,
      heading: false
    }),
    TaskItem,
    TaskList,
    Typography.configure({
      openDoubleQuote: "« ",
      closeDoubleQuote: " »"
    })
  ],
  onUpdate({ editor }) {
    // The content has changed.
    emit("update:content", JSON.stringify(editor.getJSON()));
  }
});
</script>

<template>
  <editor-content :editor="editor" />
</template>
