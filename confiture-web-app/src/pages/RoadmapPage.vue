<script setup lang="ts">
import roadmapMarkdown from "../assets/ROADMAP.md?raw";
import MarkdownRenderer from "../components/ui/MarkdownRenderer.vue";
</script>

<template>
  <MarkdownRenderer :markdown="roadmapMarkdown" />
</template>
