<script setup lang="ts">
import { generateHTML } from "@tiptap/core";
import hljs from "highlight.js";
import { computed, onMounted, ref } from "vue";

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

const html = computed(() => {
  return generateHTML(parsedDocument.value, tiptapExtensions);
});

const contentRef = ref<HTMLDivElement>();

onMounted(() => {
  contentRef.value?.querySelectorAll("pre code").forEach((el) => {
    hljs.highlightElement(el);
  });
});
</script>

<template>
  <div ref="contentRef" class="tiptap" v-html="html" />
</template>

<style>
@import url("./tiptap.css");
</style>
