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

.content {
  &:deep(h1) {
    margin-block-end: 2rem;
  }

  &:deep(h3) {
    font-size: 1.5rem;
    line-height: 2rem;
    margin-block: 2.25rem 1rem;
  }

  &:deep(h4) {
    font-size: 1.25rem;
    line-height: 2rem;
    margin-block: 0.75rem 0.5rem;
  }

  &:deep(.intro) {
    font-size: 1.125rem;
    line-height: 1.75rem;
    margin-block-end: 2.5rem;
  }

  &:deep(h4 [aria-hidden]) {
    margin-inline-end: 0.25rem;
  }
}

.top-link {
  text-align: end;
}
</style>
