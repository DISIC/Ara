<script setup lang="ts">
import roadmapMarkdown from "../assets/ROADMAP.md?raw";
import PageMeta from "../components/PageMeta";
import MarkdownRenderer from "../components/ui/MarkdownRenderer.vue";
import NewsSidebar from "../components/ui/NewsSidebar.vue";
import TopLink from "../components/ui/TopLink.vue";
</script>

<template>
  <PageMeta title="Feuille de route" />
  <div class="wrapper">
    <NewsSidebar />
    <div>
      <MarkdownRenderer class="content" :markdown="roadmapMarkdown" />
      <div class="top-link">
        <TopLink />
      </div>
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  display: grid;
  grid-template-columns: 20rem minmax(0, 1fr);
  gap: 2rem;
}

@media (width < 48rem) {
  .wrapper {
    grid-template-columns: 1fr;
  }
}

.content :deep(.mention-grey) {
  color: var(--text-mention-grey);
}

.top-link {
  text-align: end;
}
</style>
