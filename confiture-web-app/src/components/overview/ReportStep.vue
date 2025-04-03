<script setup lang="ts">
import { computed, ref } from "vue";

import router from "../../router";
import { useResultsStore } from "../../store";
import { Audit } from "../../types";
import CopyIcon from "../icons/CopyIcon.vue";
import StepCard from "./StepCard.vue";

const props = defineProps<{
  audit: Audit;
  headingLevel: "h2" | "h3";
}>();

const resultsStore = useResultsStore();

const auditIsReady = computed(() => {
  return resultsStore.auditProgress === 1;
});

const reportUrl = computed(
  () =>
    window.location.origin +
    router.resolve({
      name: "report",
      params: { uniqueId: props.audit.consultUniqueId }
    }).fullPath
);

const showCopyAlert = ref(false);
const copyButtonRef = ref<HTMLButtonElement>();

function copyReportUrl() {
  navigator.clipboard.writeText(reportUrl.value).then(() => {
    showCopyAlert.value = true;
  });
}

function onReportAlertClose() {
  copyButtonRef.value?.focus();
  showCopyAlert.value = false;
}
</script>

<template>
  <StepCard>
    <div class="fr-mb-2w step-card-heading">
      <span
        v-if="auditIsReady"
        id="report-step-status"
        class="fr-icon--lg fr-icon-checkbox-circle-fill step-card-check"
      >
        <span class="fr-sr-only">Étape terminée</span>
      </span>
      <component
        :is="headingLevel"
        class="fr-h3 fr-mb-0 step-card-title"
        aria-describedby="report-step-status"
      >
        Rapport d’audit
        <p class="fr-badge fr-badge--info fr-badge--no-icon">
          Généré automatiquement
        </p>
      </component>
    </div>
    <p class="report-step-description">
      {{
        auditIsReady
          ? "Vous pouvez livrer le rapport d’audit."
          : "Terminez l’audit avant de livrer le rapport d’audit."
      }}
    </p>
    <ul
      class="fr-btns-group fr-btns-group--inline-md fr-btns-group--icon-left report-step-actions"
    >
      <li class="fr-mb-2w fr-mb-md-0">
        <RouterLink
          :to="{
            name: 'report',
            params: { uniqueId: audit.consultUniqueId }
          }"
          target="_blank"
          class="fr-btn fr-btn--tertiary fr-mb-0"
          title="Consulter le rapport - nouvelle fenêtre"
        >
          Consulter
          <span class="fr-sr-only">(nouvelle fenêtre)</span>
        </RouterLink>
      </li>
      <li v-if="auditIsReady">
        <button
          ref="copyButtonRef"
          class="fr-btn fr-btn--secondary fr-mb-0"
          @click="copyReportUrl"
        >
          <CopyIcon class="fr-mr-2v" />
          Copier le lien de partage
          <span class="fr-sr-only">du rapport</span>
        </button>
      </li>
    </ul>

    <div role="alert" aria-live="polite" class="report-step-alert">
      <div
        v-if="showCopyAlert"
        class="fr-alert fr-alert--success fr-alert--sm fr-mt-2w"
      >
        <p>
          Le lien vers le rapport d’audit a bien été copié dans le
          presse-papier.
        </p>
        <button class="fr-link--close fr-link" @click="onReportAlertClose">
          Masquer le message
        </button>
      </div>
    </div>
  </StepCard>
</template>

<style scoped>
.report-step-description {
  grid-column: 1 / -1;
  grid-row: 2;
}

.report-step-actions {
  grid-column: 1 / -1;

  li:first-child {
    width: 50%;

    @media (width < 48rem) {
      width: 100%;
    }
  }

  li:last-child {
    min-width: 18rem;
  }

  li > a,
  li > button {
    width: calc(100% - 1rem);
  }
}

.report-step-alert {
  grid-column: 1 / -1;
}
</style>
