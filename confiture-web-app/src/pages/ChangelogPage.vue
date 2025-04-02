<script setup lang="ts">
import changelogMarkdown from "../assets/CHANGELOG.md?raw";
import PageMeta from "../components/PageMeta";
import MarkdownRenderer from "../components/ui/MarkdownRenderer.vue";
</script>

<template>
  <PageMeta title="Notes de version" />
  <MarkdownRenderer :markdown="changelogMarkdown" />
</template>
