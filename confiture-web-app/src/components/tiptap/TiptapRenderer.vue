<script setup lang="ts">
import { Editor, EditorContent, useEditor } from "@tiptap/vue-3";
import { computed, ref, ShallowRef } from "vue";

import { tiptapRenderedExtensions } from "./tiptap-extensions";

const props = defineProps<{
  document: string;
}>();

const parsedDocument = computed(() => {
  try {
    return JSON.parse(props.document);
  } catch {
    try {
      return editor.value.markdown?.instance(props.document);
    }
    catch {
      return props.document;
    }
  }
});

const editor = useEditor({
  editorProps: {
    attributes: { class: `tiptap--rendered` }
  },
  editable: false,
  content: parsedDocument.value,
  extensions: tiptapRenderedExtensions
}) as ShallowRef<Editor>;

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
