<script setup lang="ts">
import { ref } from "vue";

import AuditGenerationHeader from "../../components/AuditGenerationHeader.vue";
import AuditGenerationFilters from "../../components/AuditGenerationFilters.vue";
import AuditGenerationPageCriteria from "../../components/AuditGenerationPageCriteria.vue";

interface AuditFilter {
  search?: string;
  topics: string[];
}

const auditName = ref("Mon audit");
const auditType = ref("Complet");
const auditRisk = ref("Moyen");
const auditComplianceLevel = ref(42);

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

const pages = [
  "Accueil",
  "Contact",
  "FAQ",
  "Mentions légales",
  "Création de permis de visite",
  "Gestion de permis de visite",
];
</script>

<template>
  <AuditGenerationHeader
    :audit-name="auditName"
    :audit-type="auditType"
    :audit-risk="auditRisk"
    :audit-compliance-level="auditComplianceLevel"
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
        <ul class="fr-tabs__list" role="tablist" aria-label="Pages de l’audit">
          <li v-for="(page, i) in pages" :key="i" role="presentation">
            <button
              :id="`page-panel-${i}`"
              class="fr-tabs__tab"
              tabindex="0"
              role="tab"
              aria-selected="true"
              :aria-controls="`page-panel-${i}-panel`"
            >
              {{ page }}
            </button>
          </li>
        </ul>
        <div
          v-for="(page, i) in pages"
          :id="`page-panel-${i}-panel`"
          :key="i"
          class="fr-tabs__panel fr-tabs__panel--selected"
          role="tabpanel"
          :aria-labelledby="`page-panel-${i}`"
          tabindex="0"
        >
          <AuditGenerationPageCriteria :page="page" />
        </div>
      </div>
    </div>
  </div>
</template>
