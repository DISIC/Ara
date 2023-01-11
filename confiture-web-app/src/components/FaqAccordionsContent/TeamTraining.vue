<template>
  <p>
    Retrouvez une liste de formations dans la page
    <RouterLink class="fr-link" :to="{ name: 'accessibility-training' }"
      >formation accessibilité</RouterLink
    >.
  </p>
  <p class="fr-mb-0">
    Si vous êtes un agent de l’État, vous pouvez prétendre au financement de
    formations individuelles ou collectives pour votre équipe.
    <a
      class="fr-link"
      href="https://design.numerique.gouv.fr/accessibilite-numerique/prestations-accessibilite-numerique/"
      target="_blank"
      rel="noreferrer noopener"
      >En savoir plus
      <span class="sr-only"
        >sur le financement de formations individuelles ou collectives pour
        votre équipe (nouvelle fenêtre)</span
      ></a
    >.
  </p>
</template>
