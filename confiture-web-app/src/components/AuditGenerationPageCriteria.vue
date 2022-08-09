<script setup lang="ts">
import { computed } from "vue";

import AuditGenerationCriterium from "./AuditGenerationCriterium.vue";
import rgaa from "../criteres.json";
import { AuditPage } from "../types";
import { useFiltersStore } from "../store";

defineProps<{
  page: AuditPage;
  auditUniqueId: string;
}>();

const store = useFiltersStore();

const filteredTopics = computed(() => {
  if (!store.topics.length) return rgaa.topics;

  return rgaa.topics.filter((t) => {
    return store.topics.includes(t.number);
  });
});
</script>

<template>
  <section v-for="topic in filteredTopics" :key="topic.number" class="fr-mb-6w">
    <div class="fr-mb-3w topic-header">
      <h3 class="fr-m-0 topic-heading">
        {{ topic.number }}. {{ topic.topic }}
      </h3>
      <div class="fr-toggle fr-toggle--label-left">
        <input
          :id="`topic-switch-${topic.number}`"
          type="checkbox"
          class="fr-toggle__input"
        />
        <label
          class="fr-toggle__label topic-switch-label"
          :for="`topic-switch-${topic.number}`"
        >
          Non applicable sur la page
        </label>
      </div>
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

.topic-switch-label {
  /* FIXME: seems there is a bug in DSFR when the
  label is on the left. There is no padding on it. */
  padding-right: 1rem;
}
</style>
