<script setup lang="ts">
import { marked } from "marked";
import { ref, computed } from "vue";
import { debounce } from "lodash-es";
import { HTTPError } from "ky";

import {
  AuditPage,
  AuditType,
  CriterionResultUserImpact,
  CriteriumResult,
  CriteriumResultStatus,
  ExampleImage
} from "../../types";
import CriteriumCompliantAccordion from "./CriteriumCompliantAccordion.vue";
import CriteriumNotApplicableAccordion from "./CriteriumNotApplicableAccordion.vue";
import CriteriumNotCompliantAccordion from "./CriteriumNotCompliantAccordion.vue";
import CriteriumTestsAccordion from "./CriteriumTestsAccordion.vue";
import { useResultsStore, useFiltersStore, useAuditStore } from "../../store";
import { useNotifications } from "../../composables/useNotifications";
import RadioGroup, { RadioColor } from "../ui/RadioGroup.vue";
import { captureWithPayloads, formatStatus } from "../../utils";
import { useIsOffline } from "../../composables/useIsOffline";

const store = useResultsStore();
const auditStore = useAuditStore();
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
    label: formatStatus(CriteriumResultStatus.COMPLIANT),
    value: CriteriumResultStatus.COMPLIANT,
    color: "green"
  },
  {
    label: formatStatus(CriteriumResultStatus.NOT_COMPLIANT),
    value: CriteriumResultStatus.NOT_COMPLIANT,
    color: "red"
  },
  {
    label: formatStatus(CriteriumResultStatus.NOT_APPLICABLE),
    value: CriteriumResultStatus.NOT_APPLICABLE,
    color: "grey"
  }
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

  if (file.size > 2000000) {
    showFileSizeError.value = true;
    notify(
      "error",
      "Le téléchargement de l'exemple a échoué",
      "Poids du fichier trop lourd"
    );
    return;
  }

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
        if (error.response.status === 413) {
          showFileSizeError.value = true;
          notify(
            "error",
            "Le téléchargement de l'exemple a échoué",
            "Poids du fichier trop lourd"
          );
        }

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
            captureWithPayloads(error);
          }
        } else {
          notify(
            "error",
            "Téléchargement échoué",
            "Une erreur inconnue est survenue"
          );
          captureWithPayloads(error);
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
    .then(() => {
      if (
        store.everyCriteriumAreTested &&
        !auditStore.currentAudit?.publicationDate
      ) {
        auditStore.publishAudit(props.auditUniqueId).then(() => {
          notify(
            "info",
            "Bravo ! Il semblerait que vous ayez terminé votre audit 💪",
            auditStore.currentAudit?.auditType === AuditType.FULL
              ? "Il ne vous reste qu’à compléter la déclaration d’accessibilité avant de la livrer avec votre rapport."
              : "Il ne vous reste qu’à livrer votre rapport."
          );
        });
      }
    })
    .catch(handleUpdateResultError);
}

// Wait 500ms since the last modification before sending the PATCH request
const updateResultComment = debounce(
  async (comment: string, key: keyof CriteriumResult) => {
    try {
      await store.updateResults(props.auditUniqueId, [
        { ...result.value, [key]: comment }
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

function updateTransverseStatus(e: Event) {
  const transverse = (e.target as HTMLInputElement).checked;
  store
    .updateResults(props.auditUniqueId, [{ ...result.value, transverse }])
    .catch(handleUpdateResultError);
}

function updateQuickWin(quickWin: boolean) {
  store
    .updateResults(props.auditUniqueId, [{ ...result.value, quickWin }])
    .catch(handleUpdateResultError);
}

// Get a unique id for a criterium per page (e.g. 1-1-8)
const uniqueId = computed(() => {
  return `${props.page.id}-${props.topicNumber}-${props.criterium.number}`;
});

const isOffline = useIsOffline();
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
          'fr-mb-2w': result.status !== CriteriumResultStatus.NOT_TESTED
        }
      ]"
    >
      <RadioGroup
        :disabled="isOffline"
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
          :checked="result.transverse"
          type="checkbox"
          class="fr-toggle__input"
          :disabled="
            result.status === CriteriumResultStatus.NOT_TESTED || isOffline
          "
          @input="updateTransverseStatus"
        />
        <label
          class="fr-toggle__label"
          :for="`applicable-all-pages-${uniqueId}`"
        >
          <span class="sr-only">
            Appliquer le statut {{ formatStatus(result.status) }} pour le
            critère {{ topicNumber }}.{{ criterium.number }}
          </span>
          &nbsp;Sur toutes les pages
        </label>
      </div>
    </div>

    <!-- COMMENT / DESCRIPTION -->
    <CriteriumNotCompliantAccordion
      v-if="result.transverse"
      :id="`transverse-not-compliant-accordion-${uniqueId}`"
      :comment="''"
      :user-impact="null"
      :example-images="[]"
      :recommandation="''"
      :quick-win="false"
      :show-file-format-error="false"
      :show-file-size-error="false"
      @update:comment="() => console.log('TODO')"
      @update:user-impact="() => console.log('TODO')"
      @upload-example="() => console.log('TODO')"
      @delete-example="() => console.log('TODO')"
      @update:recommandation="() => console.log('TODO')"
      @update:quick-win="() => console.log('TODO')"
    >
      <template #title>
        Erreur(s) et recommandation(s) sur&nbsp;<strong
          >toutes les pages</strong
        >
      </template>
    </CriteriumNotCompliantAccordion>

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

    <CriteriumNotCompliantAccordion
      v-else-if="result.status === CriteriumResultStatus.NOT_COMPLIANT"
      :id="`not-compliant-accordion-${uniqueId}`"
      :comment="result.errorDescription"
      :user-impact="result.userImpact"
      :example-images="result.exampleImages"
      :recommandation="result.recommandation"
      :quick-win="result.quickWin"
      :show-file-format-error="showFileFormatError"
      :show-file-size-error="showFileSizeError"
      @update:comment="updateResultComment($event, 'errorDescription')"
      @update:user-impact="updateResultImpact($event)"
      @upload-example="handleUploadExample"
      @delete-example="handleDeleteExample"
      @update:recommandation="updateResultComment($event, 'recommandation')"
      @update:quick-win="updateQuickWin"
    />

    <!-- TESTS + METHODO -->
    <CriteriumTestsAccordion
      v-if="!filtersStore.hideTestsAndReferences"
      :class="{
        'fr-mt-2w': result.status === CriteriumResultStatus.NOT_TESTED
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
