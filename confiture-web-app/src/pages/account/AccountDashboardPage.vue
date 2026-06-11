<script lang="ts" setup>
import { computed, nextTick, onMounted, ref } from "vue";

import AuditsList from "../../components/account/dashboard/AuditsList.vue";
import DebugCard from "../../components/DebugCard.vue";
import PageMeta from "../../components/PageMeta";
import TopLink from "../../components/ui/TopLink.vue";
import { useDevMode } from "../../composables/useDevMode";
import { history } from "../../router";
import { useAuditStore } from "../../store";
import { AuditStatus } from "../../types";

const auditStore = useAuditStore();
const isDevMode = useDevMode();

// Reset password alert
const showResetPasswordAlert = ref<boolean>(!!history.state.passwordReset);
const mainHeadingRef = ref<HTMLHeadingElement>();

async function closeResetPasswordAlert() {
  showResetPasswordAlert.value = false;
  await nextTick();
  mainHeadingRef.value?.focus();
}

const inProgressAudits = computed(() => {
  return auditStore.listing?.filter(
    (a) =>
      a.status === AuditStatus.IN_PROGRESS ||
      a.status === AuditStatus.NOT_STARTED
  );
});

const completedAudits = computed(() => {
  return auditStore.listing?.filter((a) => a.status === AuditStatus.COMPLETED);
});

onMounted(() => {
  auditStore.fetchAudits();
});
</script>

<template>
  <PageMeta title="Mes audits" />

  <!-- Reset password alert -->
  <div
    v-if="showResetPasswordAlert"
    class="fr-alert fr-alert--success fr-mb-4w"
  >
    <p class="fr-alert__title">
      Votre mot de passe a été mis à jour avec succès
    </p>
    <button class="fr-link--close fr-link" @click="closeResetPasswordAlert">
      Masquer le message
    </button>
  </div>

  <!-- Debug component -->
  <DebugCard v-if="isDevMode" class="fr-mb-6w" />

  <!-- Header -->
  <div class="fr-mb-6w header">
    <h1 ref="mainHeadingRef" tabindex="-1" class="fr-mb-0">Mes audits</h1>
    <RouterLink :to="{ name: 'create-audit' }" class="fr-btn">
      Démarrer un nouvel audit
    </RouterLink>
  </div>

  <!-- In progress -->
  <AuditsList
    :audits="inProgressAudits"
    :status="AuditStatus.IN_PROGRESS"
    no-audit-label="Aucun audit en cours"
    class="fr-mb-8w"
  />

  <!-- Completed -->
  <AuditsList
    :audits="completedAudits"
    :status="AuditStatus.COMPLETED"
    no-audit-label="Aucun audit terminé"
  />

  <div class="top-link-wrapper">
    <TopLink />
  </div>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.top-link-wrapper {
  text-align: right;
}
</style>
