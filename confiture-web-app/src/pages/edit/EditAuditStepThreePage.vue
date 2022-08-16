<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { useAudit } from "../../api";
import { useAuditStats } from "../../composables/useAuditStats";
import { useResultsStore } from "../../store";
import AuditGenerationHeader from "../../components/AuditGenerationHeader.vue";
import AuditGenerationFilters from "../../components/AuditGenerationFilters.vue";
import AuditGenerationPageCriteria from "../../components/AuditGenerationPageCriteria.vue";
import { CriteriumResultStatus } from "../../types";
import rgaa from "../../criteres.json";

const route = useRoute();
const router = useRouter();

const uniqueId = route.params.uniqueId as string;
const { data: audit, error } = useAudit(uniqueId);

watch(error, (error) => {
  const errorStatus: number = error?.response?.status || 404;

  if ([404, 410].includes(errorStatus)) {
    router.replace({
      name: "Error",
      params: { pathMatch: route.path.substring(1).split("/") },
      query: route.query,
      hash: route.hash,
      state: {
        errorStatus,
      },
    });
  }
});

const resultsStore = useResultsStore();

const risk = ref<string>("");
const complianceLevel = ref<number>(0);

onMounted(() => {
  resultsStore.fetchResults(uniqueId).then(() => {
    useAuditStats(resultsStore.results, audit.value?.pages.length).then((r) => {
      risk.value = r.risk.value;
      complianceLevel.value = r.complianceLevel.value;
    });
  });
});

function toStepFour() {
  // TODO: validate API
  router.push({ name: "edit-audit-step-four", params: { uniqueId } });
}

/** Available topic filters and their global progression. */
const topics = computed(() => {
  return rgaa.topics.map((topic) => {
    // Every results for the current topic
    const relevantResults =
      resultsStore.results?.filter((result) => result.topic === topic.number) ??
      [];

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

const headerInfos = computed(() => [
  { label: "Type d’audit", value: audit.value?.auditType as string },
  { label: "Risque de l’audit", value: risk.value },
  {
    label: "Taux de conformité au RGAA actuel",
    value: complianceLevel.value,
    description: "%",
  },
]);
</script>

<template>
  <!-- FIXME: handle loading states -->
  <template v-if="audit && resultsStore.results">
    <AuditGenerationHeader
      :audit-name="audit.procedureName"
      :key-infos="headerInfos"
      @validate="toStepFour"
    />

    <div class="fr-grid-row fr-grid-row--gutters">
      <div class="fr-col-12 fr-col-md-3">
        <!-- TODO: compute results count -->
        <AuditGenerationFilters :results-count="21" :topics="topics" />
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
                :id="`page-panel-${audit.pages[0].id}`"
                class="fr-tabs__tab"
                tabindex="0"
                role="tab"
                aria-selected="true"
                :aria-controls="`page-panel-${audit.pages[0].id}-panel`"
              >
                {{ audit.pages[0].name }}
              </button>
            </li>
            <li
              v-for="page in audit.pages.slice(1)"
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
            v-for="page in audit.pages"
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
  </template>
</template>
