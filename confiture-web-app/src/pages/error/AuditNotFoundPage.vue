<script setup lang="ts">
import AuditNotFound from "../../assets/images/audit-not-found.svg";
</script>

<template>
  <div class="fr-grid-row fr-mt-7w fr-mt-md-15w">
    <div class="fr-col-12 fr-col-md-6 fr-mb-7w fr-mb-md-0">
      <h1>Audit supprimé</h1>
      <p class="fr-text--xl fr-mb-5w">
        Désolé, l’audit que vous cherchez a été supprimé.
      </p>
      <!-- TODO: make the button full width on mobile. DSFR helper? -->
      <RouterLink class="fr-btn" :to="{ name: 'home' }">
        Page d’accueil
      </RouterLink>
    </div>
    <div class="fr-col-12 fr-col-md-3 fr-col-offset-md-1">
      <img :src="AuditNotFound" alt="" />
    </div>
  </div>
</template>
