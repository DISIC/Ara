<script setup lang="ts">
import ServerError from "../../assets/images/server-error.svg";
</script>

<template>
  <div class="fr-grid-row fr-mt-7w fr-mt-md-15w">
    <div class="fr-col-12 fr-col-md-6 fr-mb-7w fr-mb-md-0">
      <h1>Erreur inattendue</h1>
      <p class="fr-text--sm">Erreur 500</p>
      <p class="fr-text--xl fr-mb-5w">
        Désolé, le service rencontre un problème. Nous travaillons pour le
        résoudre le plus rapidement possible.
      </p>
      <p class="fr-text--sm">
        Essayez de rafraîchir la page ou bien ressayez plus tard.<br />Si vous
        avez besoin d’une aide immédiate, merci de nous contacter.
      </p>
      <!-- TODO: make the button full width on mobile. DSFR helper? -->
      <!-- FIXME: link URL? -->
      <RouterLink class="fr-btn fr-btn--secondary" :to="{ name: 'home' }">
        Contactez-nous
      </RouterLink>
    </div>
    <div class="fr-col-12 fr-col-md-3 fr-col-offset-md-1">
      <img :src="ServerError" alt="" />
    </div>
  </div>
</template>
