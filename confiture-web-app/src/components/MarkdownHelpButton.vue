<script lang="ts" setup>
import { inject } from "vue";
import MarkdownIcon from "./icons/MarkdownIcon.vue";

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
  <button
    class="fr-btn fr-btn--tertiary-no-outline fr-btn--sm markdown-notice"
    @click="onClick"
  >
    <MarkdownIcon />
    Markdown pris en compte
  </button>
</template>

<style scoped>
.markdown-notice {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
