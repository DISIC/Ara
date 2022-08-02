<script setup lang="ts">
import { ref } from "vue";

import ReportResults from "../../components/ReportResults.vue";
import ReportA11yStatement from "../../components/ReportA11yStatement.vue";
import ReportErrors from "../../components/ReportErrors.vue";
import TopLink from "../../components/TopLink.vue";

const tabs = [
  { title: "Résultats", component: ReportResults },
  { title: "Déclaration d’accessibilité", component: ReportA11yStatement },
  { title: "Description des erreurs", component: ReportErrors },
];

const showCopyAlert = ref(false);

async function copyReportUrl() {
  // TODO: set correct content
  const url = "Pouet pouet";
  navigator.clipboard
    .writeText(url)
    .then(() => {
      showCopyAlert.value = true;
    })
    .catch((err) => {
      console.error(`Error copying report URL to the clipboard: ${err}.`);
    });
}

function hideReportAlert() {
  showCopyAlert.value = false;
}
</script>

<template>
  <div class="fr-mb-4w heading">
    <h1 class="fr-mb-0">Rapport d’audit accessibilité</h1>
    <div>
      <button
        class="fr-btn fr-btn--secondary fr-btn--icon-right fr-icon-links-fill"
        title="Copier le lien du rapport"
        @click="copyReportUrl"
        @blur="hideReportAlert"
      >
        Copier le lien
      </button>
    </div>
  </div>

  <div role="alert" aria-live="polite">
    <div
      v-if="showCopyAlert"
      class="fr-alert fr-alert--success fr-alert--sm fr-mb-2w"
    >
      <p>Le lien vers le rapport a bien été copié dans le presse-papier.</p>
    </div>
  </div>

  <div class="fr-mb-6w fr-mb-md-12w header">
    <p class="fr-text--lead fr-mb-2w">Nom du site audité</p>
    <p class="fr-text--light fr-mb-4w dates">
      Publié le 30 juin 2022 - Mis à jour le 03 août 2022
    </p>

    <p class="fr-mb-0">
      <strong>URL du site</strong> :
      <a class="fr-link" target="_blank" href="https://example.com">
        https://example.com
      </a>
    </p>
    <p class="fr-mb-0">
      <strong>Type d’audit</strong> : complet (106 critères)
    </p>
    <p class="fr-mb-0"><strong>Référenciel</strong> : RGAA version 4.1</p>
    <p class="fr-mb-1v"><strong>Auditeur</strong> : Prénom Nom</p>

    <RouterLink class="fr-link" :to="{ name: 'context' }">
      Voir le contexte de l’audit
    </RouterLink>
  </div>

  <div class="fr-tabs">
    <ul class="fr-tabs__list" role="tablist" aria-label="Sections du rapport">
      <li v-for="tab in tabs" :key="tab.title" role="presentation">
        <button
          :id="`tabpanel-${tab.title}`"
          class="fr-tabs__tab"
          tabindex="0"
          role="tab"
          aria-selected="true"
          :aria-controls="`tabpanel-${tab.title}-panel`"
        >
          {{ tab.title }}
        </button>
      </li>
    </ul>
    <div
      v-for="tab in tabs"
      :id="`tabpanel-${tab.title}-panel`"
      :key="tab.title"
      class="fr-tabs__panel fr-tabs__panel--selected"
      role="tabpanel"
      :aria-labelledby="`tabpanel-${tab.title}`"
      tabindex="0"
    >
      <component :is="tab.component" />
    </div>
  </div>

  <TopLink />
</template>

<style scoped>
.heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.dates {
  color: var(--text-disabled-grey);
}
</style>
