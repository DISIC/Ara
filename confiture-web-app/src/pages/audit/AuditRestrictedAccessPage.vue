<script lang="ts" setup>
import { useRoute } from "vue-router";
import RestrictedAccessImage from "../../assets/images/restricted-access.svg";
import { useWrappedFetch } from "../../composables/useWrappedFetch";
import { useAccountStore, useAuditStore } from "../../store";

const route = useRoute();
const uniqueId = route.params.uniqueId as string;
useWrappedFetch(() => auditStore.fetchAuditIfNeeded(uniqueId));
const auditStore = useAuditStore();
const accountStore = useAccountStore();
</script>
<template>
  <div class="fr-grid-row fr-mt-7w fr-mt-md-15w">
    <div class="fr-col-12 fr-col-md-6 fr-mb-7w fr-mb-md-0">
      <h1 class="fr-mb-4">Accès restreint</h1>
      <p class="fr-mb-0 fr-text--xl">L’audit <span class="fr-text--bold">« {{ auditStore.currentAudit?.procedureName }} »</span> est privé.</p>
      <p class="fr-text--xl">Pour accéder à l’audit, contactez le propriétaire de l’audit.</p>
      <div class="fr-mt-5w">
        <RouterLink
          class="fr-btn fr-mr-2w"
          :to="{ name: 'home' }"
        >
          {{ accountStore.account ? ' Mes audits' : 'Page d’accueil' }}
        </RouterLink>
      </div>
    </div>
    <div class="fr-col-12 fr-col-md-3 fr-col-offset-md-1">
      <img :src="RestrictedAccessImage" alt="" />
    </div>
  </div>
</template>

<style scoped>
 @media (width < 48rem) {
  .fr-col-md-3 {
    text-align: center;
  }
}
</style>
