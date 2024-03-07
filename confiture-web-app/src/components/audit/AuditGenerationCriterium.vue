<script setup lang="ts">
import { HTTPError } from "ky";
import { debounce } from "lodash-es";
import { marked } from "marked";
import { computed, inject, ref, watch } from "vue";

import { useIsOffline } from "../../composables/useIsOffline";
import { useNotifications } from "../../composables/useNotifications";
import { useAuditStore, useFiltersStore, useResultsStore } from "../../store";
import {
  AuditPage,
  AuditType,
  CriterionResultUserImpact,
  CriteriumResult,
  CriteriumResultStatus,
  ExampleImage
} from "../../types";
import { captureWithPayloads, formatStatus } from "../../utils";
import RadioGroup, { RadioColor } from "../ui/RadioGroup.vue";
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

const transverseResult = computed(
  () =>
    store.getTransverseCriteriumResult(
      props.topicNumber,
      props.criterium.number
    )!
);

const isResultTransverse = computed(() =>
  store.isCriteriumTransverse(result.value.topic, result.value.criterium)
);

watch(isResultTransverse, (newValue) => {
  console.log("isResultTransverse new value: ", newValue);
});

const criteriumStatus = computed(() =>
  store.getCriteriumStatus(
    props.page.id,
    props.topicNumber,
    props.criterium.number
  )
);

const notify = useNotifications();

const showFileSizeError = ref(false);
const showFileFormatError = ref(false);
const showTransverseFileSizeError = ref(false);
const showTransverseFileFormatError = ref(false);

function handleUploadExample(file: File, transverse = false) {
  if (transverse) {
    showTransverseFileFormatError.value = false;
    showTransverseFileSizeError.value = false;
  } else {
    showFileSizeError.value = false;
    showFileFormatError.value = false;
  }

  if (file.size > 2000000) {
    if (transverse) showTransverseFileSizeError.value = true;
    else showFileSizeError.value = true;
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
      transverse ? null : props.page.id,
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
            if (transverse) {
              showTransverseFileFormatError.value = true;
            } else {
              showFileFormatError.value = true;
            }
            notify(
              "error",
              "Le téléchargement de l'exemple a échoué",
              "Format de fichier non supporté"
            );
          } else if (body.message.includes("expected size")) {
            if (transverse) {
              showTransverseFileSizeError.value = true;
            } else {
              showFileSizeError.value = true;
            }
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

function handleDeleteExample(image: ExampleImage, transverse = false) {
  store
    .deleteExampleImage(
      props.auditUniqueId,
      transverse ? null : props.page.id,
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

const openTransverseNotice = inject<() => Promise<"thisPage" | "allPages">>(
  "openTransverseNotice"
);

async function updateResultStatus(status: CriteriumResultStatus) {
  let transverseNoticeChoice: "thisPage" | "allPages" | undefined;
  if (isResultTransverse.value) {
    transverseNoticeChoice = await openTransverseNotice?.();
  }

  const updatePromise =
    transverseNoticeChoice === "thisPage"
      ? store.untransversifyCriterium(
          props.auditUniqueId,
          props.page.id,
          props.topicNumber,
          props.criterium.number,
          status
        )
      : store.updateCriteriumStatus(
          props.auditUniqueId,
          props.page.id,
          props.topicNumber,
          props.criterium.number,
          status
        );

  updatePromise
    .then(() => {
      const formattedStatus = formatStatus(status);
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
      } else {
        notify(
          "success",
          undefined,
          transverseNoticeChoice === "allPages"
            ? `Critère défini comme **${formattedStatus}** sur toutes les pages`
            : `Critère défini comme ${formattedStatus} sur la page **${props.page.name}**`
        );
      }
    })
    .catch(handleUpdateResultError);
}

// Wait 500ms since the last modification before sending the PATCH request
const updateResultComment = debounce(
  async (comment: string, key: keyof CriteriumResult, transverse = false) => {
    try {
      if (transverse) {
        const update = { ...transverseResult.value, [key]: comment };
        await store.updateResults(props.auditUniqueId, [], [update]);
      } else {
        const update = { ...result.value, [key]: comment };
        await store.updateResults(props.auditUniqueId, [update], []);
      }
    } catch (error) {
      handleUpdateResultError(error);
    }
  },
  500
);

function updateResultImpact(
  userImpact: CriterionResultUserImpact | null,
  transverse = false
) {
  store
    .updateResults(
      props.auditUniqueId,
      transverse ? [] : [{ ...result.value, userImpact }],
      transverse ? [{ ...transverseResult.value, userImpact }] : []
    )
    .catch(handleUpdateResultError);
}

const openTransverseWarning = inject<() => Promise<void>>(
  "openTransverseWarning"
);

async function updateTransverseStatus(e: Event) {
  const isTransverse = !isResultTransverse.value;

  if (
    isTransverse &&
    store.isCriteriumEvaluatedAtLeastOnce(
      props.topicNumber,
      props.criterium.number,
      props.page.id
    )
  ) {
    // Prevent the default event so the checkbox doesnt appear checked before the user confirmed the modal
    e.preventDefault();
    // Show modal if the same criterion is already evaluated on another page
    await openTransverseWarning?.();
  }

  store
    .updateResultIsTransverse(
      props.auditUniqueId,
      props.page.id,
      result.value.topic,
      result.value.criterium,
      isTransverse
    )
    .then(() => {
      const status = formatStatus(result.value.status);
      notify(
        "success",
        undefined,
        isTransverse
          ? `Critère défini comme **${status}** sur toutes les pages`
          : "Critère mis à jour sur toutes les pages"
      );
    })
    .catch(handleUpdateResultError);
}

function updateQuickWin(quickWin: boolean, transverse = false) {
  store
    .updateResults(
      props.auditUniqueId,
      transverse ? [] : [{ ...result.value, quickWin }],
      transverse ? [{ ...transverseResult.value, quickWin }] : []
    )
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
          'fr-mb-2w': criteriumStatus !== CriteriumResultStatus.NOT_TESTED
        }
      ]"
    >
      <RadioGroup
        :disabled="isOffline"
        :model-value="criteriumStatus"
        :label="`Statut du critère ${topicNumber}.${criterium.number}`"
        hide-label
        :default-value="CriteriumResultStatus.NOT_TESTED"
        :items="statuses"
        @update:model-value="updateResultStatus"
      />

      <div class="fr-toggle fr-toggle--label-left">
        <input
          :id="`applicable-all-pages-${uniqueId}`"
          :checked="isResultTransverse"
          type="checkbox"
          class="fr-toggle__input"
          :disabled="
            criteriumStatus === CriteriumResultStatus.NOT_TESTED || isOffline
          "
          @click="updateTransverseStatus"
        />
        <label
          class="fr-toggle__label"
          :for="`applicable-all-pages-${uniqueId}`"
        >
          <span class="sr-only">
            Appliquer le statut {{ formatStatus(criteriumStatus) }} pour le
            critère {{ topicNumber }}.{{ criterium.number }}
          </span>
          &nbsp;Sur toutes les pages
        </label>
      </div>
    </div>

    <!-- COMMENT / DESCRIPTION -->
    <CriteriumNotCompliantAccordion
      v-if="isResultTransverse"
      :id="`transverse-not-compliant-accordion-${uniqueId}`"
      :comment="transverseResult.errorDescription"
      :user-impact="transverseResult.userImpact"
      :example-images="transverseResult.exampleImages"
      :recommandation="transverseResult.recommandation"
      :quick-win="transverseResult.quickWin"
      :show-file-format-error="showTransverseFileFormatError"
      :show-file-size-error="showTransverseFileSizeError"
      @update:comment="updateResultComment($event, 'errorDescription', true)"
      @update:user-impact="updateResultImpact($event, true)"
      @upload-example="handleUploadExample($event, true)"
      @delete-example="handleDeleteExample($event, true)"
      @update:recommandation="
        updateResultComment($event, 'recommandation', true)
      "
      @update:quick-win="updateQuickWin($event, true)"
    >
      <template #title>
        Erreur(s) et recommandation(s) sur&nbsp;<strong
          >toutes les pages</strong
        >
      </template>
    </CriteriumNotCompliantAccordion>

    <CriteriumCompliantAccordion
      v-if="criteriumStatus === CriteriumResultStatus.COMPLIANT"
      :id="`compliant-accordion-${uniqueId}`"
      :comment="result.compliantComment"
      @update:comment="updateResultComment($event, 'compliantComment')"
    />

    <CriteriumNotApplicableAccordion
      v-else-if="criteriumStatus === CriteriumResultStatus.NOT_APPLICABLE"
      :id="`not-applicable-accordion-${uniqueId}`"
      :comment="result.notApplicableComment"
      @update:comment="updateResultComment($event, 'notApplicableComment')"
    />

    <CriteriumNotCompliantAccordion
      v-else-if="criteriumStatus === CriteriumResultStatus.NOT_COMPLIANT"
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
        'fr-mt-2w': criteriumStatus === CriteriumResultStatus.NOT_TESTED
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
