<script setup lang="ts">
import ServerError from "../../assets/images/server-error.svg";
</script>

<template>
  <div class="fr-grid-row fr-mt-7w fr-mt-md-15w">
    <div class="fr-col-12 fr-col-md-6 fr-mb-7w fr-mb-md-0">
      <h1>Service indisponible</h1>
      <p class="fr-text--sm">Erreur 503</p>
      <p class="fr-text--xl fr-mb-5w">
        Désolé, le service est temporairement inaccessible, la page demandée ne
        peut être affichée.
      </p>
      <p class="fr-text--sm">
        Merci de réessayer plus tard, vous serez bientôt en mesure de réutiliser
        le service.<br />Si vous avez besoin d’une aide immédiate, merci de nous
        contacter.
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
