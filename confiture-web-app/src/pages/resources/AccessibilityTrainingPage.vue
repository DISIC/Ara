<script setup lang="ts">
import TopLink from "../../components/TopLink.vue";
import PageMeta from "../../components/PageMeta";
</script>

<template>
  <PageMeta
    title="Formations accessibilité"
    description="Retrouvez en vidéo les formations de l'équipe Design des services numériques pour réaliser."
  />

  <section class="fr-my-0 content">
    <RouterLink
      class="fr-link fr-icon-arrow-left-line fr-link--icon-left"
      to="/ressources"
    >
      Retourner à la page ressources
    </RouterLink>
    <h1 class="fr-mt-6w">Formations accessibilité</h1>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Commodi
      reiciendis adipisci provident voluptate error accusamus, voluptas quia
      deserunt ad quisquam necessitatibus mollitia voluptates non fugit
      veritatis? Illum quaerat aperiam modi!
    </p>

    <TopLink />
  </section>
</template>

<style scoped>
.content {
  max-width: 49.5rem;
}
</style>
