<script lang="ts" setup>
import { useRoute } from "vue-router";
import { useWrappedFetch } from "../../composables/useWrappedFetch";
import { useAuditStore } from "../../store";

const route = useRoute();
const uniqueId = route.params.uniqueId as string;
useWrappedFetch(() => auditStore.fetchAuditIfNeeded(uniqueId));
const auditStore = useAuditStore();
</script>
<template>
  <div>
    <h1 class="fr-mb-3v">Accès restreint</h1>
    <p>L’audit <span class="fr-text--bold fr-mb-0">« {{ auditStore.currentAudit?.procedureName }} »</span> est privé.</p>
    <p>Pour accéder à l’audit, contactez le propriétaire de l’audit.</p>
  </div>
</template>
<!--
<style scoped>
</style> -->
