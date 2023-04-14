<script lang="ts" setup>
import { marked } from "marked";
import { computed } from "vue";
import DOMPurify from "dompurify";

const props = defineProps<{
  markdown: string;
  inline?: boolean;
}>();

const html = computed(() => {
  const parse = props.inline ? marked.parseInline : marked.parse;
  const rawHtml = parse(props.markdown, {
    breaks: true,
  });
  const sanitizedHtml = DOMPurify.sanitize(rawHtml);
  return sanitizedHtml;
});
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-text-v-html-on-component -->
  <component :is="inline ? 'span' : 'div'" v-html="html"></component>
</template>
