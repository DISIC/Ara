<script lang="ts" setup>
import DOMPurify from "dompurify";
import { marked } from "marked";
import { computed } from "vue";

const props = defineProps<{
  markdown: string;
  inline?: boolean;
}>();

const html = computed(() => {
  const parse = props.inline ? marked.parseInline : marked.parse;
  const rawHtml = parse(props.markdown, {
    breaks: true
  });
  const sanitizedHtml = DOMPurify.sanitize(rawHtml);
  return sanitizedHtml;
});
</script>

<template>
  <!-- eslint-disable vue/no-v-text-v-html-on-component -->
  <component :is="inline ? 'span' : 'div'" v-html="html"></component>
</template>

<style scoped>
:deep(code) {
  background-color: var(--grey-950-100);
  padding: 0.25rem 0.75rem;
}

:deep(pre code) {
  display: block;
  padding: 0.75rem;
}

:deep(blockquote) {
  padding-left: 1rem;
  margin: 0;
  border-left: 1px solid var(--grey-425-625);
  color: var(--grey-425-625);
}
</style>
