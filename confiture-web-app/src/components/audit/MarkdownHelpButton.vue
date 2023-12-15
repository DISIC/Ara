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
    <p class="fr-text--sm fr-m-0">Markdown pris en compte</p>
    <button
      class="fr-btn fr-btn--tertiary-no-outline fr-btn--sm markdown-notice"
      type="button"
      @click="onClick"
    >
      <MarkdownIcon />
      Voir la syntaxe <span class="sr-only">Markdown</span>
    </button>
  </div>
</template>

<style scoped>
.markdown-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.markdown-notice {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
