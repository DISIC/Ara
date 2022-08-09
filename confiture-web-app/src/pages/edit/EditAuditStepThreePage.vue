<script setup lang="ts">
import { ref } from "vue";
import { useRoute } from "vue-router";

import { useAudit } from "../../api";
import AuditGenerationHeader from "../../components/AuditGenerationHeader.vue";
import AuditGenerationFilters from "../../components/AuditGenerationFilters.vue";
import AuditGenerationPageCriteria from "../../components/AuditGenerationPageCriteria.vue";

interface AuditFilter {
  search?: string;
  topics: string[];
}

const route = useRoute();
const uniqueId = route.params.uniqueId as string;
const { data: audit, error } = useAudit(uniqueId);

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
</script>

<template>
  <!-- FIXME: handle loading states -->
  <template v-if="audit">
    <AuditGenerationHeader
      :audit-name="audit.procedureName"
      :audit-type="audit.auditType!"
      audit-risk="Inconnus"
      :audit-compliance-level="42"
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
