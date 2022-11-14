<script setup lang="ts">
import { AuditPage } from "../types";
import AuditGenerationCriterium from "./AuditGenerationCriterium.vue";

import { useFiltersStore } from "../store";
import NotApplicableSwitch from "./NotApplicableSwitch.vue";

defineProps<{
  page: AuditPage;
  auditUniqueId: string;
}>();

const store = useFiltersStore();
</script>

<template>
  <!-- TODO: handle empty state -->
  <section
    v-for="topic in store.filteredTopics"
    :key="topic.number"
    class="fr-mb-6w"
  >
    <div class="fr-mb-3w topic-header">
      <h3 class="fr-m-0 topic-heading">
        {{ topic.number }}. {{ topic.topic }}
      </h3>
      <NotApplicableSwitch :page-id="page.id" :topic-number="topic.number" />
    </div>
    <ol class="fr-p-0 fr-m-0">
      <AuditGenerationCriterium
        v-for="criterium in topic.criteria"
        :key="criterium.criterium.number"
        :page="page"
        class="fr-mb-3w"
        :criterium="criterium.criterium"
        :topic-number="topic.number"
        :audit-unique-id="auditUniqueId"
      />
    </ol>
  </section>
</template>

<style scoped>
.topic-header {
  align-items: center;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
}

.topic-heading {
  color: var(--text-action-high-blue-france);
}
</style>
