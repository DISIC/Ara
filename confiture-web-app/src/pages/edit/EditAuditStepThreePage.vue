<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import AuditGenerationFilters from "../../components/AuditGenerationFilters.vue";
import AuditGenerationHeader from "../../components/AuditGenerationHeader.vue";
import AuditGenerationPageCriteria from "../../components/AuditGenerationPageCriteria.vue";
import PageMeta from "../../components/PageMeta";
import { useAuditStats } from "../../composables/useAuditStats";
import { useNotifications } from "../../composables/useNotifications";
import { useWrappedFetch } from "../../composables/useWrappedFetch";
import rgaa from "../../criteres.json";
import { useAuditStore, useResultsStore } from "../../store";
import { AuditType, CriteriumResultStatus } from "../../types";
import { formatAuditType } from "../../utils";

const route = useRoute();
const router = useRouter();

const uniqueId = route.params.uniqueId as string;
const auditStore = useAuditStore();

useWrappedFetch(() => auditStore.fetchAuditIfNeeded(uniqueId));

const resultsStore = useResultsStore();
const notify = useNotifications();

onMounted(() => {
  resultsStore.fetchResults(uniqueId);
});

/**
 * Publish audit and move to final step
 */
function toStepFour() {
  auditStore
    .publishAudit(uniqueId)
    .then(() => {
      router.push({ name: "edit-audit-step-four", params: { uniqueId } });
    })
    .catch((error) => {
      console.error(error);
      notify(
        "error",
        "Une erreur est survenue",
        "Un problème empêche la sauvegarde de vos données. Contactez nous à l'adresse contact@design.numerique.gouv.fr si le problème persiste."
      );
    });
}

/** Available topic filters and their global progression. */
const topics = computed(() => {
  return rgaa.topics.map((topic) => {
    // Every results for the current topic
    const relevantResults =
      resultsStore.allResults?.filter(
        (result) => result.topic === topic.number
      ) ?? [];

    // number of criteria for the topic accross all pages
    const relevantCount = relevantResults.length;

    // number of tested criteria for the topic accross all pages
    const testedCount =
      relevantResults.filter(
        (result) => result.status !== CriteriumResultStatus.NOT_TESTED
      ).length ?? 0;

    return {
      title: topic.topic,
      number: topic.number,
      value: Math.round((testedCount / relevantCount) * 100),
    };
  });
});

const currentPageId = ref(0);

function updateCurrentPageId(i: number) {
  currentPageId.value = i;
}

const { risk, complianceLevel } = useAuditStats(auditStore.data?.pages.length);

const headerInfos = computed(() => [
  {
    label: "Type d’audit",
    value: formatAuditType(auditStore.data!.auditType as AuditType),
  },
  { label: "Risque de l’audit", value: risk.value },
  ...(auditStore.data?.auditType === AuditType.FULL
    ? [
        {
          label: "Taux de conformité au RGAA actuel",
          value: complianceLevel.value,
          description: "%",
        },
      ]
    : []),
]);

async function handleDevButtonClick() {
  await resultsStore.DEV_fillResults(uniqueId);
  // uncoment to make the button slightly less annoying to use
  // window.scrollTo({ top: 0, behavior: "smooth" });
}
</script>

<template>
  <PageMeta
    title="Réalisation de l'audit"
    description="Réalisez simplement et validez votre audit d'accessibilité numérique."
  />

  <!-- FIXME: handle loading states -->
  <template v-if="auditStore.data && resultsStore.data">
    <AuditGenerationHeader
      :audit-name="auditStore.data.procedureName"
      :key-infos="headerInfos"
      :audit-publication-date="auditStore.data.publicationDate"
      :audit-edition-date="auditStore.data.editionDate"
      :edit-unique-id="uniqueId"
      @validate="toStepFour"
    />

    <div class="fr-grid-row fr-grid-row--gutters">
      <div class="fr-col-12 fr-col-md-3">
        <div class="filters-wrapper">
          <AuditGenerationFilters :topics="topics" />
        </div>
      </div>
      <div class="fr-col-12 fr-col-md-9">
        <div class="fr-tabs">
          <ul
            class="fr-tabs__list"
            role="tablist"
            aria-label="Pages de l’audit"
          >
            <li role="presentation">
              <button
                :id="`page-panel-${auditStore.data.pages[0].id}`"
                class="fr-tabs__tab"
                tabindex="0"
                role="tab"
                aria-selected="true"
                :aria-controls="`page-panel-${auditStore.data.pages[0].id}-panel`"
              >
                {{ auditStore.data.pages[0].name }}
              </button>
            </li>
            <li
              v-for="page in auditStore.data.pages.slice(1)"
              :key="page.id"
              role="presentation"
            >
              <button
                :id="`page-panel-${page.id}`"
                class="fr-tabs__tab"
                tabindex="0"
                role="tab"
                aria-selected="false"
                :aria-controls="`page-panel-${page.id}-panel`"
              >
                {{ page.name }}
              </button>
            </li>
          </ul>
          <div
            v-for="page in auditStore.data.pages"
            :id="`page-panel-${page.id}-panel`"
            :key="page.id"
            class="fr-tabs__panel fr-tabs__panel--selected"
            role="tabpanel"
            :aria-labelledby="`page-panel-${page.id}`"
            tabindex="0"
            v-on="{ 'dsfr.disclose': () => updateCurrentPageId(page.id) }"
          >
            <AuditGenerationPageCriteria
              v-if="currentPageId === page.id"
              :page="page"
              :audit-unique-id="uniqueId"
            />
          </div>
        </div>
      </div>
    </div>

    <button
      class="fr-btn fr-btn--tertiary-no-outline"
      @click="handleDevButtonClick"
    >
      [DEV] Remplir l’audit
    </button>
  </template>
</template>

<style scoped>
.fr-tabs {
  transition: none !important;
}
.fr-tabs__panel {
  transition: none !important;
}

.filters-wrapper {
  position: sticky;
  top: 0;
  max-height: 100vh;
  overflow-y: auto;
}
</style>
