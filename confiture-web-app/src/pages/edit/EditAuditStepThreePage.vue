<script setup lang="ts">
import { debounce } from "lodash-es";
import { computed, ref, watch } from "vue";
import { onBeforeRouteLeave, useRoute, useRouter } from "vue-router";

import AraTabs from "../../components/AraTabs.vue";
import AuditGenerationFilters from "../../components/AuditGenerationFilters.vue";
import AuditGenerationHeader from "../../components/AuditGenerationHeader.vue";
import AuditGenerationPageCriteria from "../../components/AuditGenerationPageCriteria.vue";
import PageMeta from "../../components/PageMeta";
import { useAuditStats } from "../../composables/useAuditStats";
import { useIsOffline } from "../../composables/useIsOffline";
import { useNotifications } from "../../composables/useNotifications";
import { useWrappedFetch } from "../../composables/useWrappedFetch";
import rgaa from "../../criteres.json";
import { CRITERIA_BY_AUDIT_TYPE } from "../../criteria";
import { history } from "../../router";
import { useAuditStore, useFiltersStore, useResultsStore } from "../../store";
import { AuditPage, AuditType, CriteriumResultStatus } from "../../types";
import { captureWithPayloads, getCriteriaCount, pluralize } from "../../utils";
import MarkdownHelpButton from "../../components/MarkdownHelpButton.vue";

const route = useRoute();
const router = useRouter();

const uniqueId = computed(() => route.params.uniqueId as string);
const auditStore = useAuditStore();

useWrappedFetch(async () => {
  resultsStore.$reset();
  await auditStore.fetchAuditIfNeeded(uniqueId.value);
  await resultsStore.fetchResults(uniqueId.value);
}, true);

const resultsStore = useResultsStore();
const notify = useNotifications();

/**
 * Publish audit and/or move to final step
 */
function toStepFour() {
  if (auditStore.currentAudit?.publicationDate) {
    router.push({
      name: "edit-audit-step-four",
      params: { uniqueId: uniqueId.value },
    });
  } else {
    auditStore
      .publishAudit(uniqueId.value)
      .then(() => {
        router.push({
          name: "edit-audit-step-four",
          params: { uniqueId: uniqueId.value },
        });
      })
      .catch((error) => {
        notify(
          "error",
          "Une erreur est survenue",
          "Un problème empêche la sauvegarde de vos données. Contactez-nous à l'adresse contact@design.numerique.gouv.fr si le problème persiste.",
        );
        captureWithPayloads(error);
      });
  }
}

/** Available topic filters and their global progression. */
const topics = computed(() => {
  if (!auditStore.currentAudit?.auditType) {
    return [];
  }

  return (
    rgaa.topics
      // hide topics not present in audit type
      .filter((topic) => {
        return CRITERIA_BY_AUDIT_TYPE[auditStore.currentAudit!.auditType!].find(
          (criterium) => criterium.topic === topic.number,
        );
      })
      .map((topic) => {
        // Every results for the current topic
        const relevantResults =
          resultsStore.allResults?.filter(
            (result) => result.topic === topic.number,
          ) ?? [];

        // number of criteria for the topic accross all pages
        const relevantCount = relevantResults.length;

        // number of tested criteria for the topic accross all pages
        const testedCount =
          relevantResults.filter(
            (result) => result.status !== CriteriumResultStatus.NOT_TESTED,
          ).length ?? 0;

        return {
          title: topic.topic,
          number: topic.number,
          value: Math.round((testedCount / relevantCount) * 100),
        };
      })
  );
});

function updateCurrentPageId(i: number) {
  const pageIdOrNull = auditStore.currentAudit?.pages.at(i)?.id ?? null;
  auditStore.updateCurrentPageId(pageIdOrNull);
}

const {
  complianceLevel,
  notApplicableCriteriaCount,
  notCompliantCriteriaCount,
  blockingCriteriaCount,
} = useAuditStats();

const headerInfos = computed(() => [
  ...(auditStore.currentAudit?.auditType === AuditType.FULL
    ? [
        {
          title: "Taux global de conformité",
          description: "RGAA version 4.1",
          value: complianceLevel.value,
          total: 100,
          unit: "%",
          theme: "france",
        },
      ]
    : []),
  {
    title: "Critères non conformes",
    description: `Dont ${blockingCriteriaCount.value} bloquants pour l’usager`,
    value: notCompliantCriteriaCount.value,
    total: getCriteriaCount(auditStore.currentAudit?.auditType as AuditType),
    theme: "marianne",
  },
  {
    title: "Critères non applicables",
    description: `Sur un total de ${getCriteriaCount(
      auditStore.currentAudit?.auditType as AuditType,
    )} critères`,
    value: notApplicableCriteriaCount.value,
    total: getCriteriaCount(auditStore.currentAudit?.auditType as AuditType),
  },
]);

function closeAuditEmailAlert() {
  auditStore.showAuditEmailAlert = false;
  focusPageHeading();
}

onBeforeRouteLeave(() => {
  auditStore.showAuditEmailAlert = false;
});

function focusPageHeading() {
  const pageHeading = document.querySelector("h1");
  pageHeading?.setAttribute("tabindex", "-1");
  pageHeading?.focus();
}

const showFilters = ref(true);

function toggleFilters(value: boolean) {
  showFilters.value = value;
}

const showDuplicatedAlert = ref(!!history.state.showDuplicatedAlert);

watch(route, () => {
  if (history.state.showDuplicatedAlert) {
    showDuplicatedAlert.value = true;
  }
});

function closeDuplicatedAuditAlert() {
  showDuplicatedAlert.value = false;
  focusPageHeading();
}

const auditNotes = computed(() => {
  return auditStore.currentAudit?.notes || "";
});

const updateAuditNotes = debounce(async (notes: string) => {
  try {
    await auditStore.updateAuditNotes(uniqueId.value, {
      notes,
    });
  } catch (error) {
    handleUpdateResultError(error);
  }
}, 500);

function handleUpdateResultError(err: unknown) {
  console.log(err);
  notify(
    "error",
    "Une erreur est survenue",
    "Un problème empêche la sauvegarde de vos données. Contactez-nous à l'adresse ara@design.numerique.gouv.fr si le problème persiste.",
  );
}

const isOffline = useIsOffline();

const filterStore = useFiltersStore();
const filterResultsCount = computed(() =>
  filterStore.filteredTopics
    .map((t) => t.criteria.length)
    .reduce((total, length) => (total += length), 0),
);

watch(
  () => auditStore.currentAudit?.pages,
  (curr, prev) => {
    if (curr && !prev) {
      auditStore.currentPageId = auditStore.currentAudit!.pages[0].id;
    }
  },
);

const pageTitle = computed(() => {
  // Audit XXX - [Page en cours « XXX » | Notes] - X résultats pour « XXX »
  if (auditStore.currentAudit) {
    let title = `Audit ${auditStore.currentAudit.procedureName}`;

    const tabName = auditStore.currentPageId
      ? ` - Page en cours « ${auditStore.currentAudit.pages.find(
          (p) => p.id === auditStore.currentPageId,
        )?.name} »`
      : " - Notes";

    title += tabName;

    if (filterStore.search) {
      const results = ` - ${filterResultsCount.value} ${pluralize(
        "résultat",
        "résultats",
        filterResultsCount.value,
      )} pour « ${filterStore.search} »`;

      title += results;
    }

    return title;
  }

  return "";
});

type NotesData = { _notes: true };
type TabData = { label: string; data: AuditPage | NotesData };

const tabsData = computed(() => {
  return [
    ...(auditStore.currentAudit?.pages.map((p) => ({
      label: p.name,
      data: p,
    })) ?? []),
    { data: { _notes: true }, label: "Notes", icon: "draft-line" },
  ] as TabData[];
});

function isNotesData(data: AuditPage | NotesData): data is NotesData {
  return (data as NotesData)._notes !== undefined;
}
</script>

<template>
  <!-- FIXME: handle loading states -->
  <div v-if="auditStore.currentAudit && resultsStore.data" class="page-wrapper">
    <PageMeta
      :title="pageTitle"
      description="Réalisez simplement et validez votre audit d'accessibilité numérique."
    />

    <div v-if="showDuplicatedAlert" class="fr-alert fr-alert--success fr-mb-3w">
      <p class="fr-alert__title">Audit copié avec succès</p>
      <p>
        Des liens pour accéder à cet audit et de son rapport viennent de vous
        être envoyés par mail.
      </p>
      <button
        class="fr-btn--close fr-btn"
        title="Masquer le message"
        @click="closeDuplicatedAuditAlert"
      >
        Masquer le message
      </button>
    </div>

    <div
      v-if="auditStore.showAuditEmailAlert"
      class="fr-alert fr-alert--info fr-mb-3w"
    >
      <p class="fr-alert__title">Retrouvez votre audit</p>
      <p>
        Des liens pour accéder à cet audit et à son rapport viennent de vous
        être envoyés par e-mail à l’adresse
        <strong>{{ auditStore.currentAudit.auditorEmail }}</strong>
      </p>
      <button
        class="fr-btn--close fr-btn"
        title="Masquer le message"
        @click="closeAuditEmailAlert"
      >
        Masquer le message
      </button>
    </div>

    <div
      v-if="
        auditStore.currentAudit.publicationDate &&
        !auditStore.currentAudit.editionDate
      "
    >
      <RouterLink
        class="fr-text--sm fr-mb-4w back-summary-link"
        :to="{
          name: 'edit-audit-step-four',
          params: { uniqueId },
        }"
      >
        Retour à la synthèse
      </RouterLink>
    </div>

    <AuditGenerationHeader
      :audit-name="auditStore.currentAudit.procedureName"
      :key-infos="headerInfos"
      :audit-publication-date="auditStore.currentAudit.publicationDate"
      :audit-edition-date="auditStore.currentAudit.editionDate"
      :edit-unique-id="uniqueId"
    >
      <template #actions>
        <li class="fr-mr-2w">
          <component
            :is="isOffline ? 'button' : 'RouterLink'"
            class="fr-btn fr-btn--secondary"
            :to="{
              name: 'report',
              params: { uniqueId: auditStore.currentAudit?.consultUniqueId },
            }"
            target="_blank"
            :disabled="isOffline"
          >
            Consulter le rapport
            <span class="sr-only">(Nouvelle fenêtre)</span>
          </component>
        </li>
        <li
          v-if="
            !auditStore.currentAudit.publicationDate ||
            (auditStore.currentAudit.editionDate &&
              auditStore.currentAudit.editionDate >
                auditStore.currentAudit.publicationDate)
          "
        >
          <button
            :disabled="!resultsStore.everyCriteriumAreTested || isOffline"
            class="fr-btn"
            :aria-describedby="
              auditStore.currentAudit.publicationDate
                ? auditStore.currentAudit.editionDate
                  ? undefined
                  : 'validation-notice'
                : 'validation-notice'
            "
            @click="toStepFour"
          >
            {{
              auditStore.currentAudit.publicationDate
                ? auditStore.currentAudit.editionDate
                  ? "Mettre à jour l’audit"
                  : "Valider l’audit"
                : "Valider l’audit"
            }}
          </button>
        </li>
      </template>
      <template v-if="!resultsStore.everyCriteriumAreTested" #actions-notice>
        <p id="validation-notice" class="fr-text--xs fr-mb-1w submit-notice">
          Validation possible à la fin de l’audit
        </p>
      </template>
    </AuditGenerationHeader>

    <div class="fr-grid-row columns">
      <div
        :class="[
          `fr-col-12 fr-col-md-${showFilters ? '3' : '1'}`,
          { 'fr-px-0': showFilters },
        ]"
      >
        <div
          :class="['filters-wrapper', 'fr-pb-6w', { 'fr-pr-3v': showFilters }]"
          role="search"
        >
          <AuditGenerationFilters
            :topics="topics"
            @toggle-filters="toggleFilters"
          />
        </div>
      </div>
      <div :class="`fr-col-12 fr-col-md-${showFilters ? '9' : '11'}`">
        <AraTabs :tabs="tabsData" @change="updateCurrentPageId">
          <template #panel="{ data }">
            <template v-if="isNotesData(data)">
              <div class="fr-input-group fr-mb-1w">
                <label class="fr-label" for="audit-notes"
                  >Notes annexes
                  <span class="fr-hint-text">
                    Exemple : remarques et recommandations générales sur le site
                    audité. Ces notes seront affichées dans le rapport d’audit.
                  </span>
                </label>
                <textarea
                  id="audit-notes"
                  :value="auditNotes"
                  rows="20"
                  class="fr-input"
                  :disabled="isOffline"
                  @input="
                    updateAuditNotes(
                      ($event.target as HTMLTextAreaElement).value,
                    )
                  "
                ></textarea>
              </div>

              <MarkdownHelpButton id="markdown-notice-notes" />
            </template>
            <AuditGenerationPageCriteria
              v-else
              :page="data"
              :audit-unique-id="uniqueId"
            />
          </template>
        </AraTabs>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Override DSFR columns width */
.columns {
  --gap: 1.5rem;
  --filters-column-width: 2rem;
}

@media (max-width: 992px) {
  .columns {
    --gap: 1rem;
  }
}
.fr-col-md-1 {
  flex: 0 0 var(--filters-column-width) !important;
}

.fr-col-md-11 {
  flex-grow: 1 !important;
  max-width: calc(
    100% - calc(var(--filters-column-width) + var(--gap))
  ) !important; /* Sidebar width + gap */
  width: auto !important;
}

.back-summary-link {
  display: inline-block;
}

.filters-wrapper {
  position: sticky;
  top: 55px;
  max-height: 100vh;
  overflow-y: auto;
}

.submit-notice {
  text-align: right;
}

.page-wrapper {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.page-wrapper > :deep(*) {
  flex-basis: 100%;
  max-width: 100%;
}
</style>
