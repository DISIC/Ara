<script lang="ts" setup>
// This component is used for custom DSFR artworks
defineProps<{
  /**
   * `.svg` file must comply to following guidelines: https://www.systeme-de-design.gouv.fr/version-courante/fr/fondamentaux/pictogramme#ajout-de-pictogrammes-dans-la-librairie
   */
  filePath: string;
}>();
</script>

<template>
  <svg
    class="fr-artwork"
    aria-hidden="true"
    viewBox="0 0 80 80"
    width="80px"
    height="80px"
  >
    <use
      class="fr-artwork-decorative"
      :xlink:href="`${filePath}#artwork-decorative`"
    ></use>
    <use
      class="fr-artwork-minor"
      :xlink:href="`${filePath}#artwork-minor`"
    ></use>
    <use
      class="fr-artwork-major"
      :xlink:href="`${filePath}#artwork-major`"
    ></use>
  </svg>
</template>
