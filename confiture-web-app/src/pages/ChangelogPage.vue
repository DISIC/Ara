<script setup lang="ts">
import changelogMarkdown from "../assets/CHANGELOG.md?raw";
import MarkdownRenderer from "../components/ui/MarkdownRenderer.vue";
</script>

<template>
  <MarkdownRenderer :markdown="changelogMarkdown" />
</template>
