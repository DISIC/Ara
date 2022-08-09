<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";

import { useAudit } from "../../api";
import { useResultsStore } from "../../store";
import AuditGenerationHeader from "../../components/AuditGenerationHeader.vue";
import AuditGenerationFilters from "../../components/AuditGenerationFilters.vue";
import AuditGenerationPageCriteria from "../../components/AuditGenerationPageCriteria.vue";
import { CriteriumResultStatus } from "../../types";

interface AuditFilter {
  search?: string;
  topics: string[];
}

const route = useRoute();
const uniqueId = route.params.uniqueId as string;
const { data: audit, error } = useAudit(uniqueId);

const store = useResultsStore();

onMounted(() => {
  store.fetchResults(uniqueId);
});

function validateAudit() {
  console.log("validateAudit");
}

function filter(payload: AuditFilter) {
  console.log("filter", payload);
}

const topics = ref([
  { title: "Images", value: 25 },
  { title: "Cadres", value: 12 },
  { title: "Couleurs", value: 3 },
  { title: "Multimédia", value: 0 },
  { title: "Tableaux", value: 12 },
  { title: "Liens", value: 0 },
  { title: "Scripts", value: 88 },
  { title: "Éléments obligatoires", value: 100 },
  { title: "Structuration de l'information", value: 67 },
  { title: "Présentation de l'information", value: 0 },
  { title: "Formulaires", value: 23 },
  { title: "Navigation", value: 4 },
  { title: "Consultation", value: 56 },
]);

const currentPageId = ref(0);

function updateCurrentPageId(i: number) {
  currentPageId.value = i;
}

// FIXME: calculate compliance by dedoubling criteria (compliance accross all pages)
const complianceLevel = computed(() => {
  const testedCount =
    store.results?.filter(
      (result) =>
        result.status !== CriteriumResultStatus.NOT_TESTED &&
        result.status !== CriteriumResultStatus.NOT_APPLICABLE
    ).length ?? 0;

  const compliantCount =
    store.results?.filter(
      (result) => result.status === CriteriumResultStatus.COMPLIANT
    ).length ?? 0;

  if (testedCount === 0) {
    return 0;
  }

  return Math.round((compliantCount / testedCount) * 100);
});

const risk = computed(() => {
  if (complianceLevel.value < 50) {
    return "Élevé";
  } else if (complianceLevel.value < 75) {
    return "Moyen";
  } else {
    return "Bas";
  }
});
</script>

<template>
  <!-- FIXME: handle loading states -->
  <template v-if="audit && store.results">
    <AuditGenerationHeader
      :audit-name="audit.procedureName"
      :audit-type="audit.auditType!"
      :audit-risk="risk"
      :audit-compliance-level="complianceLevel"
      @validate="validateAudit"
    />

    <div class="fr-grid-row fr-grid-row--gutters">
      <div class="fr-col-12 fr-col-md-3">
        <AuditGenerationFilters
          :results-count="21"
          :topics="topics"
          @filter="filter"
        />
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
