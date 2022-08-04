<script setup lang="ts">
import { ref } from "vue";
import AuditGenerationHeader from "../../components/AuditGenerationHeader.vue";

const auditName = ref("Mon audit");
const auditType = ref("Complet");
const auditRisk = ref("Moyen");
const auditComplianceLevel = ref(42);

function validateAudit() {
  console.log("validateAudit");
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
</template>
