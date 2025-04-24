<script setup lang="ts">
import { useRoute } from "vue-router";

import roadmapMarkdown from "../assets/ROADMAP.md?raw";
import PageMeta from "../components/PageMeta";
import MarkdownRenderer from "../components/ui/MarkdownRenderer.vue";

const menuItems = [
  { name: "roadmap", label: "Feuille de route" },
  { name: "changelog", label: "Notes de version" }
];

const route = useRoute();

function isCurrentPage(routeName: string): boolean {
  return route.name === routeName;
}
</script>

<template>
  <PageMeta title="Feuille de route" />
  <div class="wrapper">
    <nav class="fr-sidemenu" aria-labelledby="fr-sidemenu-title">
      <div class="fr-sidemenu__inner">
        <button
          class="fr-sidemenu__btn"
          hidden
          aria-controls="fr-sidemenu-wrapper"
          aria-expanded="false"
        >
          Dans cette rubrique
        </button>
        <div id="fr-sidemenu-wrapper" class="fr-collapse">
          <p id="fr-sidemenu-title" class="fr-sidemenu__title fr-sr-only">
            Dans cette rubrique
          </p>
          <ul class="fr-sidemenu__list">
            <li
              v-for="item in menuItems"
              :key="item.name"
              :class="[
                'fr-sidemenu__item',
                { 'fr-sidemenu__item--active': isCurrentPage(item.name) }
              ]"
            >
              <RouterLink
                class="fr-sidemenu__link"
                :to="{ name: item.name }"
                :aria-current="isCurrentPage(item.name) ? 'page' : undefined"
              >
                {{ item.label }}
              </RouterLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
    <MarkdownRenderer class="content" :markdown="roadmapMarkdown" />
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
</style>
