<script setup lang="ts">
import { computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import AuditGenerationPageCriteria from "../../components/audit/AuditGenerationPageCriteria.vue";
import { TabSlug } from "../../enums";
import { useAuditStore } from "../../store";

const route = useRoute();
const router = useRouter();

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

// TODO: fetch only the current page results here, and use request result as 404 check

watch(() => auditStore.entities[route.params.uniqueId as string], (audit) => {
  const pageSlug = route.params.tabSlug as string;

  if (
    !audit ||
    (pageSlug === TabSlug.AUDIT_COMMON_ELEMENTS_SLUG
      && audit.transverseElementsPage)
  ) {
    return;
  }

  if (!audit.pages.some(p => p.slug === pageSlug)) {
    // TODO: replace 404 page with a special audit page not found tab content ?
    router.replace({
      name: "Error",
      params: { pathMatch: route.path.substring(1).split("/") },
      query: route.query,
      hash: route.hash,
      state: {
        errorStatus: 404
      }
    });
  }
}, { immediate: true });
</script>

<template>
  <AuditGenerationPageCriteria
    v-if="page"
    :audit-unique-id="route.params.uniqueId as string"
    :page="page"
  />
</template>
