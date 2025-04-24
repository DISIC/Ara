<script setup lang="ts">
import changelogMarkdown from "../assets/CHANGELOG.md?raw";
import PageMeta from "../components/PageMeta";
import MarkdownRenderer from "../components/ui/MarkdownRenderer.vue";
import NewsSidebar from "../components/ui/NewsSidebar.vue";
import TopLink from "../components/ui/TopLink.vue";
</script>

<template>
  <PageMeta title="Notes de version" />
  <div class="wrapper">
    <NewsSidebar />
    <div>
      <MarkdownRenderer class="content" :markdown="changelogMarkdown" />
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

.top-link {
  text-align: end;
}
</style>
