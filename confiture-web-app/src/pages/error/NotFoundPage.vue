<script setup lang="ts">
import ServerError from "../../assets/images/server-error.svg";
</script>

<template>
  <div class="fr-grid-row fr-mt-7w fr-mt-md-15w">
    <div class="fr-col-12 fr-col-md-6 fr-mb-7w fr-mb-md-0">
      <h1>Page non trouvée</h1>
      <p class="fr-text--sm">Erreur 404</p>
      <p class="fr-text--xl fr-mb-5w">
        La page que vous cherchez est introuvable. Excusez-nous pour la gêne
        occasionnée.
      </p>
      <p class="fr-text--sm">
        Si vous avez tapé l’adresse web dans le navigateur, vérifiez qu’elle est
        correcte. La page n’est peut-être plus disponible.<br />Dans ce cas,
        pour continuer votre visite vous pouvez consulter notre page d’accueil,
        ou effectuer une recherche avec notre moteur de recherche en haut de
        page.Sinon contactez-nous pour que l’on puisse vous rediriger vers la
        bonne information.
      </p>
      <div>
        <!-- TODO: make the button full width on mobile. DSFR helper? -->
        <RouterLink class="fr-btn fr-mr-2w" :to="{ name: 'home' }">
          Page d’accueil
        </RouterLink>
        <!-- FIXME: link URL? -->
        <RouterLink class="fr-btn fr-btn--secondary" :to="{ name: 'home' }">
          Contactez-nous
        </RouterLink>
      </div>
    </div>
    <div class="fr-col-12 fr-col-md-3 fr-col-offset-md-1">
      <img :src="ServerError" alt="" />
    </div>
  </div>
</template>
