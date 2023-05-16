<script lang="ts" setup>
import greenCheck from "../../../assets/images/green-check.svg";

defineProps<{ userEmail: string }>();
</script>

<template>
  <div class="wrapper">
    <div class="fr-mb-3w title">
      <img class="fr-mr-2w check-icon" :src="greenCheck" alt="" />
      <h1 class="fr-h3 fr-m-0" tabindex="-1">
        Votre compte a été créé avec succès
      </h1>
    </div>

    <p class="fr-mb-3w">Connectez-vous pour accédez à votre espace.</p>

    <RouterLink
      :to="{ name: 'login', state: { email: userEmail } }"
      class="fr-link fr-icon-arrow-right-line fr-link--icon-right"
    >
      Aller à la page de connexion
    </RouterLink>
  </div>
</template>

<style scoped>
.wrapper {
  max-width: 49.5rem;
  margin: 0 auto;
}

.title {
  display: flex;
  align-items: center;
}

.check-icon {
  width: 2rem;
}
</style>
