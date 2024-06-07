<script lang="ts" setup></script>

<template>
  <div class="markdown-wrapper">
    <p class="fr-text--sm fr-m-0">
      Markdown pris en compte
      <RouterLink
        class="fr-btn fr-btn--tertiary-no-outline fr-btn--sm"
        href="/syntaxe-markdown"
        target="_blank"
        title="Voir la syntaxe Markdown - nouvelle fenêtre"
        to="{ name: 'markdown-syntax'}"
      >
        Voir la syntaxe<span class="sr-only"> Markdown</span>
      </RouterLink>
    </p>
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
