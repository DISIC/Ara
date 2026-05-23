<script setup lang="ts">
import { useFetch } from "@vueuse/core";
import { computed } from "vue";
import { useRoute } from "vue-router";
import AuditGenerationPageCriteria from "../../components/audit/AuditGenerationPageCriteria.vue";
import { TabSlug } from "../../enums";
import { useAuditStore } from "../../store";
import { GetPageWithResultsDto } from "../../types";
import { showErrorPage } from "../../utils";

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

// TODO: fetch using some store methods instead of useFetch (although it’s pretty neat)
const pageApiUrl = computed(() => `/api/audits/${route.params.uniqueId}/pages/${route.params.tabSlug}`);
useFetch<GetPageWithResultsDto>(pageApiUrl, {
  refetch: true,
  onFetchError(ctx) {
    showErrorPage(ctx.response?.status);
    return ctx;
  }
});
</script>

<template>
  <AuditGenerationPageCriteria
    v-if="page"
    :audit-unique-id="route.params.uniqueId as string"
    :page="page"
  />
</template>
