<script lang="ts" setup>
import { ref, nextTick } from "vue";

import { AuditStatus } from "../../types";
import { useAccountStore } from "../../store/account";
import TopLink from "../../components/TopLink.vue";
import AuditsList from "../../components/account/dashboard/AuditsList.vue";

// Account alert
const accountStore = useAccountStore();
const mainHeadingRef = ref<HTMLHeadingElement>();

const showAuditsAlert = ref(
  // TODO: rename "confiture" into "ara" for all localStorage things
  !localStorage.getItem("confiture:hide-account-audits-alert")
);

async function hideAuditsAlert() {
  localStorage.setItem("confiture:hide-account-audits-alert", "true");
  showAuditsAlert.value = false;
  await nextTick();
  mainHeadingRef.value?.focus();
}
</script>

<template>
  <!-- Alert -->
  <div v-if="showAuditsAlert" class="fr-alert fr-alert--info fr-mb-4w">
    <h3 class="fr-alert__title">Bienvenue dans votre espace 👋</h3>
    <p class="fr-mb-3v">
      Vous trouverez ici tous les audits associés à votre adresse e-mail :
      <strong>{{ accountStore.account?.email }}</strong>
    </p>
    <p>
      <RouterLink class="fr-link" :to="{ name: 'missing-audit' }">
        Un de vos audit manque dans votre espace ?
      </RouterLink>
    </p>
    <button
      class="fr-btn--close fr-btn"
      title="Masquer le message"
      @click="hideAuditsAlert"
    >
      Masquer le message
    </button>
  </div>

  <!-- Header -->
  <div class="fr-mb-6w header">
    <h1 ref="mainHeadingRef" tabindex="-1" class="fr-mb-0">Mes audits</h1>
    <RouterLink :to="{ name: 'new-audit-step-one' }" class="fr-btn">
      Démarrer un nouvel audit
    </RouterLink>
  </div>

  <!-- In progress -->
  <AuditsList
    :audits="[]"
    :status="AuditStatus.IN_PROGRESS"
    no-audit-label="Aucun audit en cours"
    class="fr-mb-8w"
  />

  <!-- Completed -->
  <AuditsList
    :audits="[]"
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
