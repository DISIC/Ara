<script setup lang="ts">
import { Editor, EditorContent, useEditor } from "@tiptap/vue-3";
import { onMounted, ref, ShallowRef } from "vue";

import { getTipTapRenderedExtensions } from "./tiptap-extensions";

const props = defineProps<{
  document: string;
  basicMode?: boolean;
}>();

function parseDocument(document: string) {
  try {
    return JSON.parse(document);
  } catch {
    try {
      return editor.value.markdown?.instance(document);
    }
    catch {
      return document;
    }
  }
}

const editor = useEditor({
  editorProps: {
    attributes: { class: `tiptap--rendered` }
  },
  editable: false,
  extensions: getTipTapRenderedExtensions(props.basicMode)
}) as ShallowRef<Editor>;

onMounted(() => {
  editor.value.commands.setContent(parseDocument(props.document));
});

const contentRef = ref<HTMLDivElement>();
</script>

<template>
  <div ref="contentRef">
    <editor-content :editor="editor" />
  </div>
</template>

<style>
@import url("./tiptap.css");
@import url("./tiptap-hljs.css");

.tiptap--rendered .ProseMirror-selectednode {
  outline: none;
}
</style>
