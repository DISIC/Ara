<script lang="ts" setup>
import { marked } from "marked";
import { computed } from "vue";

const props = defineProps<{
  markdown: string;
}>();

const html = computed(() => marked.parse(props.markdown));
</script>

<template>
  <div v-html="html"></div>
</template>
