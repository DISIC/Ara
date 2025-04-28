<script setup lang="ts">
import { Editor, EditorContent, useEditor } from "@tiptap/vue-3";
import hljs from "highlight.js";
import { computed, onMounted, ref, ShallowRef } from "vue";

import { tiptapExtensions } from "./tiptap-extensions";

const props = defineProps<{
  document: string;
}>();

const parsedDocument = computed(() => {
  try {
    return JSON.parse(props.document);
  } catch {
    return props.document;
  }
});

const editor = useEditor({
  editable: false,
  content: parsedDocument.value,
  extensions: tiptapExtensions
}) as ShallowRef<Editor>;

const contentRef = ref<HTMLDivElement>();

onMounted(() => {
  contentRef.value?.querySelectorAll("pre code").forEach((el) => {
    hljs.highlightElement(el as HTMLElement);
  });
});
</script>

<template>
  <div ref="contentRef">
    <editor-content :editor="editor" />
  </div>
</template>

<style>
@import url("./tiptap.css");
</style>
