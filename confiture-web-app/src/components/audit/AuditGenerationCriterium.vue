<script setup lang="ts">
import { debounce } from "lodash-es";
import { marked } from "marked";
import { computed, Ref, ref } from "vue";

import { useIsOffline } from "../../composables/useIsOffline";
import { useNotifications } from "../../composables/useNotifications";
import { LINKED_CRITERIA } from "../../criteria";
import { FileErrorMessage } from "../../enums";
import { useAuditStore, useFiltersStore, useResultsStore } from "../../store";
import {
  AuditPage,
  AuditType,
  CriterionResultUserImpact,
  CriteriumResult,
  CriteriumResultStatus
} from "../../types";
import {
  formatStatus,
  handleFileDeleteError
} from "../../utils";
import TiptapRenderer from "../tiptap/TiptapRenderer.vue";
import { FileListFile } from "../ui/FileList.vue";
import { RadioColor } from "../ui/Radio.vue";
import RadioGroup from "../ui/RadioGroup.vue";
import CriteriumCompliantAccordion from "./CriteriumCompliantAccordion.vue";
import CriteriumNotApplicableAccordion from "./CriteriumNotApplicableAccordion.vue";
import CriteriumNotCompliantAccordion from "./CriteriumNotCompliantAccordion.vue";
import CriteriumTestsAccordion from "./CriteriumTestsAccordion.vue";

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
      "Le focus se déplacera dans le champ « Erreur et recommandation »",
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

const transversePageId = computed(() => {
  return auditStore.currentAudit?.transverseElementsPage.id;
});

const transverseStatus = computed((): CriteriumResultStatus | null => {
  if (store.data && transversePageId.value) {
    return store.data?.[transversePageId.value][props.topicNumber][
      props.criterium.number
    ].status;
  }

  return null;
});

const transverseComment = computed((): string | null => {
  if (store.data && transversePageId.value) {
    const result =
      store.data?.[transversePageId.value][props.topicNumber][
        props.criterium.number
      ];

    switch (transverseStatus.value) {
      case CriteriumResultStatus.COMPLIANT:
        return result.compliantComment;
      case CriteriumResultStatus.NOT_COMPLIANT:
        return result.notCompliantComment;
      case CriteriumResultStatus.NOT_APPLICABLE:
        return result.notApplicableComment;
      default:
        return null;
    }
  }

  return null;
});

const showTransverseComment = ref(false);

function toggleTransverseComment() {
  showTransverseComment.value = !showTransverseComment.value;
}

const notify = useNotifications();

const errorMessage: Ref<FileErrorMessage | null> = ref(null);
const criteriumNotCompliantAccordion =
  ref<InstanceType<typeof CriteriumNotCompliantAccordion>>();

function handleFileDeleteAfterConfirm(flFile: FileListFile) {
  const file = result.value.exampleImages.find(f => f.key === flFile.key)!;
  store
    .deleteExampleImage(
      props.auditUniqueId,
      props.page.id,
      props.topicNumber,
      props.criterium.number,
      file.id
    )
    .then(() => {
      notify("success", undefined, `Image supprimée`);
      errorMessage.value = null;
    })
    .catch(async (error) => {
      errorMessage.value = await handleFileDeleteError(error);
      auditStore.lastRequestFailed = true;
    });
}

function handleUpdateResultError(err: any) {
  console.log(err);
  auditStore.lastRequestFailed = true;
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

      if (store.everyCriteriumAreTested) {
        auditStore.publishAudit(props.auditUniqueId).then(() => {
          notify(
            "info",
            "Bravo ! Vous êtes sur le point de terminer votre audit 🎉",
            auditStore.currentAudit?.auditType === AuditType.FULL
              ? "Une fois le dernier critère complété, vous pourrez livrer votre rapport d’audit et rédiger la déclaration d’accessibilité."
              : "Une fois le dernier critère complété, vous pourrez livrer votre rapport d’audit",
            {
              link: {
                label: "Accéder aux livrables",
                to: {
                  name: "audit-overview",
                  params: { uniqueId: props.auditUniqueId }
                }
              }
            }
          );
        });
      }
    })
    .then(() => {
      store.lastUpdatedTopic = result.value.topic;
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

const showTransverseStatus = computed(() => {
  return (
    props.page.id !== transversePageId.value &&
    transverseStatus &&
    transverseStatus.value !== CriteriumResultStatus.NOT_TESTED
  );
});

// Check status of linked parent criterium
const parentCriterium = computed(() => {
  for (const key in LINKED_CRITERIA) {
    if (!LINKED_CRITERIA[key].includes(`${props.topicNumber}.${props.criterium.number}`)) {
      continue;
    }

    const [parentTopic, parentCriterium] = key.split(".").map(Number);
    const parentResult =
      store.getCriteriumResult(props.page.id, parentTopic, parentCriterium);

    if (parentResult?.status === CriteriumResultStatus.NOT_APPLICABLE) {
      return key;
    }
  }

  return null;
});
</script>

<template>
  <li class="fr-p-2w criterium-container">
    <h4 class="fr-mb-2w fr-text--md criterium-main-section">
      <span class="fr-text--bold criterium-number">
        {{ topicNumber }}.{{ criterium.number }}&nbsp;
      </span>
      <span
        class="fr-text--bold criterium-title"
        v-html="marked.parseInline(criterium.title)"
      />
    </h4>

    <!-- STATUS -->
    <div
      :class="`fr-ml-6w criterium-radios-container ${
        showTransverseStatus ? 'fr-mb-3v' : 'fr-mb-2w'
      }`"
    >
      <RadioGroup
        :disabled="isOffline"
        :model-value="result.status"
        hide-label
        :default-value="CriteriumResultStatus.NOT_TESTED"
        :items="statuses"
        @update:model-value="updateResultStatus"
      >
        <template #label>
          Statut du critère {{ topicNumber }}.{{ criterium.number }}
        </template>
      </RadioGroup>
    </div>

    <!-- LINKED CRITERIA STATUS -->
    <div
      v-if="parentCriterium"
      class="fr-ml-md-5w fr-mb-1w fr-px-1w criterium-linked-notice"
    >
      <span class="fr-icon-information-line fr-icon--sm" aria-hidden="true" />
      <p class="fr-text--sm fr-m-0">
        Vous avez évalué le critère {{ parentCriterium }}
        <strong class="fr-badge fr-badge--sm fr-badge--no-icon'">
          {{ formatStatus(CriteriumResultStatus.NOT_APPLICABLE) }}
        </strong>
      </p>
    </div>

    <!-- TRANSVERSE STATUS -->
    <div
      v-if="showTransverseStatus"
      class="fr-ml-0 fr-ml-md-5w fr-mb-4w fr-px-1w"
      :class="{ 'criterium-transverse-is-open': showTransverseComment }"
    >
      <div class="criterium-transverse-notice">
        <span class="fr-icon-information-line fr-icon--sm" aria-hidden="true" />
        <p class="fr-text--sm fr-m-0">
          Vous avez évalué ce critère
          <strong
            :class="[
              'fr-badge fr-badge--sm fr-badge--no-icon',
              {
                'fr-badge--success':
                  transverseStatus === CriteriumResultStatus.COMPLIANT,
                'fr-badge--error':
                  transverseStatus === CriteriumResultStatus.NOT_COMPLIANT
              }
            ]"
          >{{ formatStatus(transverseStatus!) }}</strong>
          pour les éléments transverses.
        </p>

        <button
          v-if="transverseComment"
          class="fr-link fr-link--sm criterium-transverse-button"
          @click="toggleTransverseComment"
        >
          {{ showTransverseComment ? "Masquer" : "Voir" }}
          {{
            transverseStatus === CriteriumResultStatus.NOT_COMPLIANT
              ? "les erreurs"
              : "le commentaire"
          }}
          <span class="fr-sr-only">transverse</span>
          <span class="fr-icon-arrow-down-s-line fr-icon--sm" />
        </button>
      </div>

      <TiptapRenderer
        v-if="showTransverseComment && transverseComment"
        :document="transverseComment"
        class="fr-mt-5w"
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
      :on-delete="handleFileDeleteAfterConfirm"
      @update:comment="updateResultComment($event, 'notCompliantComment')"
      @update:quick-win="updateQuickWin"
      @update:user-impact="updateResultImpact($event)"
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

.criterium-linked-notice {
  display: flex;
  gap: 0.75rem;
}

.criterium-transverse-is-open {
  background: var(--background-contrast-info);
}

.criterium-transverse-notice {
  align-items: start;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.75rem;

  @media (width < 36rem) {
    grid-template-columns: 1rem 1fr;

    .criterium-transverse-button {
      grid-column: 2;
    }
  }
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
