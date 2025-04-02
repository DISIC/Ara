<script setup lang="ts">
import roadmapMarkdown from "../assets/ROADMAP.md?raw";
import PageMeta from "../components/PageMeta";
import MarkdownRenderer from "../components/ui/MarkdownRenderer.vue";
</script>

<template>
  <PageMeta title="Feuille de route" />
  <MarkdownRenderer :markdown="roadmapMarkdown" />
</template>
