<script setup lang="ts">
import MarkdownRenderer from "../components/MarkdownRenderer.vue";
import changelogMarkdown from "../../../CHANGELOG.md?raw";
</script>

<template>
  <MarkdownRenderer :markdown="changelogMarkdown" />
</template>
