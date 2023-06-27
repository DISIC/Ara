<script setup lang="ts">
import MarkdownRenderer from "../components/MarkdownRenderer.vue";
import changelogMarkdown from "../assets/CHANGELOG.md?raw";
</script>

<template>
  <MarkdownRenderer :markdown="changelogMarkdown" />
</template>
