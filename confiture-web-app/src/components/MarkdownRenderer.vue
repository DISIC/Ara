<script lang="ts" setup>
import { marked } from "marked";
import { computed } from "vue";
import DOMPurify from "dompurify";

const props = defineProps<{
  markdown: string;
}>();

const html = computed(() => {
  const rawHtml = marked.parse(props.markdown);
  const sanitizedHtml = DOMPurify.sanitize(rawHtml);
  return sanitizedHtml;
});
</script>

<template>
  <div v-html="html"></div>
</template>
