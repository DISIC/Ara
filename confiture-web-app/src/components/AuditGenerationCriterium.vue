<script setup lang="ts">
import { marked } from "marked";
import { ref, computed, watch, reactive } from "vue";
import { debounce } from "lodash-es";
import { HTTPError } from "ky";

import {
  AuditPage,
  CriteriumResult,
  CriteriumResultStatus,
  ExampleImage,
} from "../types";
import CriteriumCompliantAccordion from "./CriteriumCompliantAccordion.vue";
import CriteriumNotApplicableAccordion from "./CriteriumNotApplicableAccordion.vue";
import CriteriumNotCompliantAccordion from "./CriteriumNotCompliantAccordion.vue";
import CriteriumRecommendationAccordion from "./CriteriumRecommendationAccordion.vue";
import CriteriumTestsAccordion from "./CriteriumTestsAccordion.vue";
import { useResultsStore } from "../store";
import { useNotifications } from "../composables/useNotifications";
import RadioGroup, { RadioColor } from "./RadioGroup.vue";
import { captureException } from "@sentry/core";

const store = useResultsStore();

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

const result = reactive<CriteriumResult>({
  // This component should not be rendered before the audit results are fetched
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  ...store.getCriteriumResult(
    props.page.id,
    props.topicNumber,
    props.criterium.number
  )!,
});

/*
the result status can be updated from an external source (the not applicable
page switch and the autofill debug button)
So we watch the store to make sure to update our local state if needed.
*/
watch(
  () =>
    store.getCriteriumResult(
      props.page.id,
      props.topicNumber,
      props.criterium.number
    ),
  (newValue) => {
    result.status = newValue!.status;
  }
);

const notify = useNotifications();

watch(
  result,
  // Wait 500ms since the last modification before sending the PATCH request
  debounce(async () => {
    try {
      await store.updateResults(props.auditUniqueId, [result]);
    } catch (error) {
      console.log(error);
      notify(
        "error",
        "Une erreur est survenue",
        "Un problème empêche la sauvegarde de vos données. Contactez-nous à l'adresse contact@design.numerique.gouv.fr si le problème persiste."
      );
    }
  }, 500)
);

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

function handleApplyToAllPages() {
  console.log(result.status, "to all pages!");
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
    <RadioGroup
      v-model="result.status"
      class="fr-ml-6w"
      :label="`Statut du critère ${topicNumber}.${criterium.number}`"
      hide-label
      :default-value="CriteriumResultStatus.NOT_TESTED"
      :items="statuses"
      @apply-to-all-pages="handleApplyToAllPages"
    />

    <!-- FIXME: left/right arrow bug -->
    <!-- COMMENT / DESCRIPTION -->
    <CriteriumCompliantAccordion
      v-if="result.status === CriteriumResultStatus.COMPLIANT"
      :id="`compliant-accordion-${uniqueId}`"
      v-model:comment="result.compliantComment"
    />

    <CriteriumNotApplicableAccordion
      v-else-if="result.status === CriteriumResultStatus.NOT_APPLICABLE"
      :id="`not-applicable-accordion-${uniqueId}`"
      v-model:comment="result.notApplicableComment"
    />

    <template v-else-if="result.status === CriteriumResultStatus.NOT_COMPLIANT">
      <CriteriumNotCompliantAccordion
        :id="`not-compliant-accordion-${uniqueId}`"
        v-model:comment="result.errorDescription"
        v-model:user-impact="result.userImpact"
        :example-images="result.exampleImages"
        :show-file-format-error="showFileFormatError"
        :show-file-size-error="showFileSizeError"
        @upload-example="handleUploadExample"
        @delete-example="handleDeleteExample"
      />
      <!-- RECOMMENDATION -->
      <CriteriumRecommendationAccordion
        :id="`recommendation-${uniqueId}`"
        v-model:comment="result.recommandation"
      />
    </template>

    <!-- TESTS + METHODO -->
    <CriteriumTestsAccordion
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
  border: none;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
</style>
