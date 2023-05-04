<script setup lang="ts">
import { marked } from "marked";
import { ref, computed } from "vue";
import { debounce } from "lodash-es";
import { HTTPError } from "ky";

import {
  AuditPage,
  CriterionResultUserImpact,
  CriteriumResult,
  CriteriumResultStatus,
  ExampleImage,
} from "../types";
import CriteriumCompliantAccordion from "./CriteriumCompliantAccordion.vue";
import CriteriumNotApplicableAccordion from "./CriteriumNotApplicableAccordion.vue";
import CriteriumNotCompliantAccordion from "./CriteriumNotCompliantAccordion.vue";
import CriteriumRecommendationAccordion from "./CriteriumRecommendationAccordion.vue";
import CriteriumTestsAccordion from "./CriteriumTestsAccordion.vue";
import { useResultsStore, useFiltersStore } from "../store";
import { useNotifications } from "../composables/useNotifications";
import RadioGroup, { RadioColor } from "./RadioGroup.vue";
import { captureException } from "@sentry/core";

const store = useResultsStore();
const filtersStore = useFiltersStore();

const props = defineProps<{
  topicNumber: number;
  // FIXME: type things
  criterium: any;
  page: AuditPage;
  auditUniqueId: string;
}>();

const statuses: Array<{
  label: string;
  value: CriteriumResultStatus;
  color?: RadioColor;
}> = [
  {
    label: "Conforme",
    value: CriteriumResultStatus.COMPLIANT,
    color: "green",
  },
  {
    label: "Non conforme",
    value: CriteriumResultStatus.NOT_COMPLIANT,
    color: "red",
  },
  {
    label: "Non applicable",
    value: CriteriumResultStatus.NOT_APPLICABLE,
    color: "grey",
  },
];

const result = computed(
  () =>
    store.getCriteriumResult(
      props.page.id,
      props.topicNumber,
      props.criterium.number
    )!
);

const notify = useNotifications();

const showFileSizeError = ref(false);
const showFileFormatError = ref(false);

function handleUploadExample(file: File) {
  showFileSizeError.value = false;
  showFileFormatError.value = false;

  store
    .uploadExampleImage(
      props.auditUniqueId,
      props.page.id,
      props.topicNumber,
      props.criterium.number,
      file
    )
    .then(() => {
      notify("success", "Exemple téléchargé avec succès.");
    })
    .catch(async (error) => {
      if (error instanceof HTTPError) {
        // Unprocessable Entity
        if (error.response.status === 422) {
          const body = await error.response.json();

          if (body.message.includes("expected type")) {
            showFileFormatError.value = true;
            notify(
              "error",
              "Le téléchargement de l'exemple a échoué",
              "Format de fichier non supporté"
            );
          } else if (body.message.includes("expected size")) {
            showFileSizeError.value = true;
            notify(
              "error",
              "Le téléchargement de l'exemple a échoué",
              "Poids du fichier trop lourd"
            );
          } else {
            notify(
              "error",
              "Le téléchargement de l'exemple a échoué",
              "Une erreur inconnue est survenue"
            );
            captureException(error);
          }
        } else {
          notify(
            "error",
            "Téléchargement échoué",
            "Une erreur inconnue est survenue"
          );
          captureException(error);
        }
      }
    });
}

function handleDeleteExample(image: ExampleImage) {
  store
    .deleteExampleImage(
      props.auditUniqueId,
      props.page.id,
      props.topicNumber,
      props.criterium.number,
      image.id
    )
    .then(() => {
      notify("success", "Exemple supprimé avec succès");
    })
    .catch(() => {
      notify(
        "error",
        "Echec de la suppression de l'exemple",
        "Une erreur inconnue empêche la suppression de l'exemple."
      );
    });
}

function handleUpdateResultError(err: any) {
  console.log(err);
  notify(
    "error",
    "Une erreur est survenue",
    "Un problème empêche la sauvegarde de vos données. Contactez-nous à l'adresse contact@design.numerique.gouv.fr si le problème persiste."
  );
}

function updateResultStatus(status: CriteriumResultStatus) {
  store
    .updateResults(props.auditUniqueId, [{ ...result.value, status }])
    .catch(handleUpdateResultError);
}

// Wait 500ms since the last modification before sending the PATCH request
const updateResultComment = debounce(
  async (comment: string, key: keyof CriteriumResult) => {
    try {
      await store.updateResults(props.auditUniqueId, [
        { ...result.value, [key]: comment },
      ]);
    } catch (error) {
      handleUpdateResultError(error);
    }
  },
  500
);

function updateResultImpact(userImpact: CriterionResultUserImpact | null) {
  store
    .updateResults(props.auditUniqueId, [{ ...result.value, userImpact }])
    .catch(handleUpdateResultError);
}

// Get a unique id for a criterium per page (e.g. 1-1-8)
const uniqueId = computed(() => {
  return `${props.page.id}-${props.topicNumber}-${props.criterium.number}`;
});
</script>

<template>
  <li class="fr-p-2w criterium-container">
    <div class="fr-mb-2w criterium-main-section">
      <span class="fr-text--bold criterium-number">
        {{ topicNumber }}.{{ criterium.number }}
      </span>
      <div
        class="fr-text--bold criterium-title"
        v-html="marked.parseInline(criterium.title)"
      />
    </div>

    <!-- STATUS -->
    <div
      :class="[
        'fr-ml-6w criterium-radios-container',
        {
          'fr-mb-2w': result.status !== CriteriumResultStatus.NOT_TESTED,
        },
      ]"
    >
      <RadioGroup
        :model-value="result.status"
        :label="`Statut du critère ${topicNumber}.${criterium.number}`"
        hide-label
        :default-value="CriteriumResultStatus.NOT_TESTED"
        :items="statuses"
        @update:model-value="updateResultStatus"
      />

      <div class="fr-toggle fr-toggle--label-left">
        <input
          :id="`applicable-all-pages-${uniqueId}`"
          v-model="result.transverse"
          type="checkbox"
          class="fr-toggle__input"
          :disabled="result.status === CriteriumResultStatus.NOT_TESTED"
        />
        <label
          class="fr-toggle__label fr-pr-2w"
          :for="`applicable-all-pages-${uniqueId}`"
        >
          Sur toutes les pages
        </label>
      </div>
    </div>

    <!-- FIXME: left/right arrow bug -->
    <!-- COMMENT / DESCRIPTION -->
    <CriteriumCompliantAccordion
      v-if="result.status === CriteriumResultStatus.COMPLIANT"
      :id="`compliant-accordion-${uniqueId}`"
      :comment="result.compliantComment"
      @update:comment="updateResultComment($event, 'compliantComment')"
    />

    <CriteriumNotApplicableAccordion
      v-else-if="result.status === CriteriumResultStatus.NOT_APPLICABLE"
      :id="`not-applicable-accordion-${uniqueId}`"
      :comment="result.notApplicableComment"
      @update:comment="updateResultComment($event, 'notApplicableComment')"
    />

    <template v-else-if="result.status === CriteriumResultStatus.NOT_COMPLIANT">
      <CriteriumNotCompliantAccordion
        :id="`not-compliant-accordion-${uniqueId}`"
        :comment="result.errorDescription"
        :user-impact="result.userImpact"
        :example-images="result.exampleImages"
        :show-file-format-error="showFileFormatError"
        :show-file-size-error="showFileSizeError"
        @update:comment="updateResultComment($event, 'errorDescription')"
        @update:user-impact="updateResultImpact($event)"
        @upload-example="handleUploadExample"
        @delete-example="handleDeleteExample"
      />
      <!-- RECOMMENDATION -->
      <CriteriumRecommendationAccordion
        :id="`recommendation-${uniqueId}`"
        :comment="result.recommandation"
        @update:comment="updateResultComment($event, 'recommandation')"
      />
    </template>

    <!-- TESTS + METHODO -->
    <CriteriumTestsAccordion
      v-if="!filtersStore.hideTestsAndReferences"
      :class="{
        'fr-mt-2w': result.status === CriteriumResultStatus.NOT_TESTED,
      }"
      :topic-number="topicNumber"
      :criterium="criterium"
    />
  </li>
</template>

<style scoped>
.criterium-container {
  background: var(--background-alt-blue-france);
  border-radius: 0.25rem;
  list-style: none;
}

.criterium-container::marker {
  content: none;
}

.criterium-main-section {
  display: grid;
  grid-template-columns: 2.5rem 1fr;
  gap: 0.5rem;
}

.criterium-number,
.criterium-title {
  color: var(--text-action-high-grey);
}

.criterium-radios-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0 1rem;
}
</style>
