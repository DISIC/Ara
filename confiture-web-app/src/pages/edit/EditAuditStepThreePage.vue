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
      <AuditGenerationFilters :results-count="21" @search="search" />
    </div>
    <div class="fr-col-12 fr-col-md-9">
      <AuditGenerationCriteria />
    </div>
  </div>
</template>
