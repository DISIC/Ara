<script setup lang="ts">
import { debounce } from "lodash-es";
import { marked } from "marked";
import { computed, Ref, ref } from "vue";

import { useIsOffline } from "../../composables/useIsOffline";
import { useNotifications } from "../../composables/useNotifications";
import { FileErrorMessage } from "../../enums";
import { useAuditStore, useFiltersStore, useResultsStore } from "../../store";
import {
  AuditFile,
  AuditPage,
  AuditType,
  CriterionResultUserImpact,
  CriteriumResult,
  CriteriumResultStatus
} from "../../types";
import {
  formatStatus,
  handleFileDeleteError,
  handleFileUploadError
} from "../../utils";
import { RadioColor } from "../ui/Radio.vue";
import RadioGroup from "../ui/RadioGroup.vue";
import CriteriumCompliantAccordion from "./CriteriumCompliantAccordion.vue";
import CriteriumNotApplicableAccordion from "./CriteriumNotApplicableAccordion.vue";
import CriteriumNotCompliantAccordion from "./CriteriumNotCompliantAccordion.vue";
import CriteriumTestsAccordion from "./CriteriumTestsAccordion.vue";
import DeleteFileModal from "./DeleteFileModal.vue";

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
  extraLabel?: string;
  value: CriteriumResultStatus;
  color?: RadioColor;
}> = [
  {
    label: formatStatus(CriteriumResultStatus.COMPLIANT),
    value: CriteriumResultStatus.COMPLIANT,
    color: RadioColor.GREEN
  },
  {
    label: formatStatus(CriteriumResultStatus.NOT_COMPLIANT),
    extraLabel:
      "Le focus se déplacera dans le champ « Erreur et recommandation »",
    value: CriteriumResultStatus.NOT_COMPLIANT,
    color: RadioColor.RED
  },
  {
    label: formatStatus(CriteriumResultStatus.NOT_APPLICABLE),
    value: CriteriumResultStatus.NOT_APPLICABLE,
    color: RadioColor.GREY
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

// TODO: UX is not finalized.
const transverseStatus = computed((): CriteriumResultStatus | null => {
  if (store.data) {
    return store.data?.[-1][props.topicNumber][props.criterium.number].status;
  }

  return null;
});

const notify = useNotifications();

const errorMessage: Ref<FileErrorMessage | null> = ref(null);
const criteriumNotCompliantAccordion =
  ref<InstanceType<typeof CriteriumNotCompliantAccordion>>();

function handleUploadExample(file: File) {
  store
    .uploadExampleImage(
      props.auditUniqueId,
      props.page.id,
      props.topicNumber,
      props.criterium.number,
      file
    )
    .then(() => {
      errorMessage.value = null;
    })
    .catch(async (error) => {
      errorMessage.value = await handleFileUploadError(error);
    })
    .finally(() => {
      criteriumNotCompliantAccordion.value?.onFileRequestFinished();
    });
}

const deleteFileModalRef = ref<InstanceType<typeof DeleteFileModal>>();
const fileToDelete = ref<AuditFile>();

function openDeleteFileModal(image: AuditFile) {
  deleteFileModalRef.value?.show();
  fileToDelete.value = image;
}

function handleDeleteExample() {
  if (!fileToDelete.value) return;

  store
    .deleteExampleImage(
      props.auditUniqueId,
      props.page.id,
      props.topicNumber,
      props.criterium.number,
      fileToDelete.value.id
    )
    .then(() => {
      errorMessage.value = null;
    })
    .catch(async (error) => {
      errorMessage.value = await handleFileDeleteError(error);
    })
    .finally(() => {
      criteriumNotCompliantAccordion.value?.onFileRequestFinished();
      deleteFileModalRef.value?.hide();
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
      if (status === CriteriumResultStatus.NOT_COMPLIANT) {
        criteriumNotCompliantAccordion.value?.disclose();
      }

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
    <div
      v-if="
        page.id !== -1 &&
        transverseStatus &&
        [
          CriteriumResultStatus.NOT_COMPLIANT,
          CriteriumResultStatus.NOT_APPLICABLE
        ].includes(transverseStatus)
      "
      class="fr-mb-2w criterium-transverse-notice"
    >
      <span class="fr-icon-information-line fr-icon--sm" aria-hidden="true" />
      <p class="fr-text--sm fr-m-0">
        Vous avez déjà évalué ce critère à
        <strong>{{ formatStatus(transverseStatus) }}</strong> sur toutes les
        pages
        <button class="fr-link fr-link--sm fr-ml-3v">
          Voir le critère <span class="fr-sr-only">transverse</span>
        </button>
      </p>
    </div>

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
    </div>

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

    <CriteriumNotCompliantAccordion
      v-else-if="result.status === CriteriumResultStatus.NOT_COMPLIANT"
      :id="`not-compliant-accordion-${uniqueId}`"
      ref="criteriumNotCompliantAccordion"
      :comment="result.notCompliantComment"
      :user-impact="result.userImpact"
      :example-images="result.exampleImages"
      :quick-win="result.quickWin"
      :error-message="errorMessage"
      @update:comment="updateResultComment($event, 'notCompliantComment')"
      @update:user-impact="updateResultImpact($event)"
      @upload-file="handleUploadExample"
      @delete-file="openDeleteFileModal"
      @update:quick-win="updateQuickWin"
    />

    <DeleteFileModal
      ref="deleteFileModalRef"
      :mime-type="fileToDelete?.mimetype"
      @confirm="handleDeleteExample"
      @cancel="deleteFileModalRef?.hide()"
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

.criterium-transverse-notice {
  align-items: start;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.75rem;
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
  gap: 0.5rem 1rem;
}
</style>
