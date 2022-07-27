<script setup lang="ts">
import { ref } from "vue";

const showCopyAlert = ref(false);

async function copyReportUrl() {
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
        class="fr-btn fr-btn--secondary fr-icon-links-fill"
        title="Copier le lien du rapport"
        @click="copyReportUrl"
        @blur="hideReportAlert"
      >
        Copier le lien du rapport
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

  <div class="fr-mb-6w header">
    <p class="fr-text--lead fr-mb-2w">Nom du site audité</p>
    <p class="fr-text--light fr-mb-4w dates">
      Publié le 30 juin 2022 - Mis à jour le 03 août 2022
    </p>

    <p class="fr-mb-0">
      <strong>URL du site</strong> :
      <a class="fr-link" href="https://example.com">https://example.com</a>
    </p>
    <p class="fr-mb-0">
      <strong>Type d’audit</strong> : complet (106 critères)
    </p>
    <p class="fr-mb-0"><strong>Référenciel</strong> : RGAA version 4.1</p>
    <p class="fr-mb-0"><strong>Auditeur</strong> : Prénom Nom</p>
  </div>
</template>

<style>
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
