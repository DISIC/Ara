<template>
  <p class="markdown-wrapper fr-text--sm fr-m-0">
    <span class="markdown-wrapper__text">Markdown pris en compte</span>
    <br class="fr-sr-only" />
    <RouterLink
      class="fr-link fr-text--sm markdown-wrapper__link"
      href="/syntaxe-markdown"
      target="_blank"
      title="Voir la syntaxe Markdown - nouvelle fenêtre"
      to="{ name: 'markdown-syntax'}"
      >Voir la syntaxe<span class="sr-only"> Markdown</span>
    </RouterLink>
  </p>
</template>

<style scoped>
.markdown-wrapper {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem 0.5rem;
}
</style>
