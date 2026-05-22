<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import AuditGenerationPageCriteria from "../../components/audit/AuditGenerationPageCriteria.vue";
import { useAuditStore } from "../../store";

const route = useRoute();

const auditStore = useAuditStore();
const page = computed(() => {
  return auditStore.entities[route.params.uniqueId as string]
    ?.pages.find(p => p.slug === route.params.tabSlug);
});
</script>

<template>
  <p>hiii {{ route.params.uniqueId }} {{ route.params.tabSlug }}</p>
  <AuditGenerationPageCriteria v-if="page" :audit-unique-id="route.params.uniqueId as string" :page="page" />
</template>
