<script lang="ts" setup>
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Highlight from "@tiptap/extension-highlight";
import { Image as ImageExtension } from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import Typography from "@tiptap/extension-typography";
import StarterKit from "@tiptap/starter-kit";
import { Editor, EditorContent, useEditor } from "@tiptap/vue-3";
import css from "highlight.js/lib/languages/css";
import js from "highlight.js/lib/languages/javascript";
import ts from "highlight.js/lib/languages/typescript";
import html from "highlight.js/lib/languages/xml";
// load common languages
import { common, createLowlight } from "lowlight";
import { Markdown } from "tiptap-markdown";
import { computed, ShallowRef } from "vue";
import { useRoute } from "vue-router";

import { useNotifications } from "../../composables/useNotifications";
import { ImageUploadTiptapExtension } from "../../tiptap/ImageUploadTiptapExtension";

// create a lowlight instance
const lowlight = createLowlight(common);

// you can also register languages
lowlight.register("html", html);
lowlight.register("css", css);
lowlight.register("js", js);
lowlight.register("ts", ts);

const route = useRoute();
const notify = useNotifications();

const props = defineProps<{
  content: string;
  labelledBy: string;
}>();
const emit = defineEmits(["update:content"]);

const uniqueId = computed(() => route.params.uniqueId as string);

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
  editorProps: {
    attributes: {
      "aria-labelledby": props.labelledBy,
      "aria-describedby": "tiptap-description",
      rows: "10",
      "aria-multiline": "true",
      role: "textbox"
    }
  },
  content: getContent(),
  extensions: [
    CodeBlockLowlight.configure({ lowlight, defaultLanguage: "html" }),
    Highlight,
    Link,
    Markdown,
    StarterKit.configure({
      codeBlock: false,
      heading: {
        levels: [2, 3, 4, 5, 6]
      }
    }),
    TaskItem,
    TaskList,
    ImageExtension.extend({
      addAttributes() {
        return {
          ...this.parent?.(),
          width: {
            default: "0"
          },
          height: {
            default: "0"
          }
        };
      }
    }).configure({ inline: false }),
    ImageUploadTiptapExtension.configure({
      uniqueId: uniqueId.value
    }),
    Typography.configure({
      openDoubleQuote: "« ",
      closeDoubleQuote: " »"
    })
  ],
  onUpdate({ editor }) {
    // The content has changed.
    emit("update:content", JSON.stringify(editor.getJSON()));
  }
}) as ShallowRef<Editor>;
</script>

<template>
  <div>
    <p id="tiptap-description" class="fr-sr-only">
      Éditeur de texte riche, vous pouvez utiliser le format Markdown ou bien
      utiliser les raccourcis clavier.
    </p>
    <editor-content :editor="editor" />
  </div>
</template>
