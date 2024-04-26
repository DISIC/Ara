<script lang="ts" setup>
import { inject } from "vue";
import MarkdownIcon from "../icons/MarkdownIcon.vue";

// Provided in App.vue
const openMarkdownHelp = inject<() => void>("openMarkdownHelp");
if (!openMarkdownHelp) {
  console.warn(
    "Cannot inject `openMarkdownHelp`. Make sure it is provided somewhere higher in the component tree."
  );
}

function onClick() {
  openMarkdownHelp && openMarkdownHelp();
}
</script>

<template>
  <div class="markdown-wrapper">
    <p class="fr-text--sm fr-m-0"><MarkdownIcon /> Markdown pris en compte</p>
    <a
      class="fr-btn fr-btn--tertiary-no-outline fr-btn--sm"
      href="/syntaxe-markdown"
      target="_blank"
      title="Voir la syntaxe Markdown"
    >
      Voir la syntaxe<span class="sr-only"> Markdown</span>
    </a>
  </div>
</template>

<style scoped>
.markdown-wrapper {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem 0.5rem;
}
</style>
