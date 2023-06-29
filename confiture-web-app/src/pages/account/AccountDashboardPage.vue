<script lang="ts" setup>
import { ref, nextTick } from "vue";

import { useAccountStore } from "../../store/account";

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

  <h1 ref="mainHeadingRef" tabindex="-1">Mes audits</h1>
</template>
