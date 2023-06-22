<script setup lang="ts">
import MarkdownRenderer from "../components/MarkdownRenderer.vue";
import roadmapMarkdown from "../../../ROADMAP.md?raw";
</script>

<template>
  <MarkdownRenderer :markdown="roadmapMarkdown" />
</template>
