<script setup lang="ts">
import { ref } from "vue";
import AuditGenerationHeader from "../../components/AuditGenerationHeader.vue";
import AuditGenerationFilters from "../../components/AuditGenerationFilters.vue";
import AuditGenerationCriteria from "../../components/AuditGenerationCriteria.vue";

const auditName = ref("Mon audit");
const auditType = ref("Complet");
const auditRisk = ref("Moyen");
const auditComplianceLevel = ref(42);

function validateAudit() {
  console.log("validateAudit");
}

function search(value: string) {
  console.log("search: " + value);
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
        @search="search"
      />
    </div>
    <div class="fr-col-12 fr-col-md-9">
      <AuditGenerationCriteria />
    </div>
  </div>
</template>
