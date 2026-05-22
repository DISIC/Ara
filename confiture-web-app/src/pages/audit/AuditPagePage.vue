<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import AuditGenerationPageCriteria from "../../components/audit/AuditGenerationPageCriteria.vue";
import { TabSlug } from "../../enums";
import { useAuditStore } from "../../store";

const route = useRoute();

const auditStore = useAuditStore();

const page = computed(() => {
  const pageSlug = route.params.tabSlug as string;
  const auditUniqueId = route.params.uniqueId as string;

  // we are on the route for transverse elements page
  if (pageSlug === TabSlug.AUDIT_COMMON_ELEMENTS_SLUG) {
    return auditStore.entities[auditUniqueId].transverseElementsPage;
  }

  return auditStore.entities[auditUniqueId as string]
    ?.pages.find(p => p.slug === pageSlug);
});

// TODO: fetch only the current page results here
// TODO: check if page exists and show 404 here
</script>

<template>
  <AuditGenerationPageCriteria
    v-if="page"
    :audit-unique-id="route.params.uniqueId as string"
    :page="page"
  />
</template>
