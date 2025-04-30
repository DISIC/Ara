<script setup lang="ts">
import { computed } from "vue";

import { useAuditStore, useFiltersStore } from "../../store";
import { AuditPage } from "../../types";
import TopLink from "../ui/TopLink.vue";
import AuditGenerationCriterium from "./AuditGenerationCriterium.vue";
import NotApplicableSwitch from "./NotApplicableSwitch.vue";
import TransverseElementsList from "./TransverseElementsList.vue";

defineProps<{
  page: AuditPage;
  auditUniqueId: string;
}>();

const store = useFiltersStore();
const auditStore = useAuditStore();

const transversePageId = computed(() => {
  return auditStore.currentAudit?.transverseElementsPage.id;
});

const noResults = computed(() => {
  if (store.hasNoResultsFromEvaluated) {
    return {
      title: "Tous les critères évalués ont été masqués",
      description:
        'Veuillez décocher le filtre "Masquer les critères évalués" pour afficher de nouveau les critères.'
    };
  } else if (store.hasNoResultsFromComplianceLevel) {
    return {
      title: "Aucun critères ne correspond à vos filtres",
      description: [
        "Consultez les autres pages de l’échantillon",
        "Modifiez les filtres"
      ]
    };
  } else if (store.hasNoResultsFromSearch && !store.hideEvaluatedCriteria) {
    return {
      title: "Aucun résultat ne correspond à votre recherche",
      description:
        "Le système de recherche par mots clés s'applique uniquement à l’intitulé des critères."
    };
  } else {
    return {
      title: "Tous les critères évalués ont été masqués",
      description:
        'Veuillez décocher le filtre "Masquer les critères évalués" pour afficher de nouveau les critères.'
    };
  }
});
</script>

<template>
  <!-- TODO: handle empty state -->
  <h2 class="fr-sr-only">{{ page.name }}</h2>

  <div v-if="page.id !== transversePageId" class="fr-mb-3w page-url">
    <a class="fr-link fr-link--sm" :href="page.url" target="_blank">
      {{ page.url }} <span class="fr-sr-only">(nouvelle fenêtre)</span>
    </a>
  </div>

  <TransverseElementsList v-else class="fr-mb-3w transverse-elements" />

  <template v-if="store.filteredTopics.length">
    <section
      v-for="topic in store.filteredTopics"
      :key="topic.number"
      class="fr-mb-6w"
    >
      <div class="fr-mb-3w topic-header">
        <h3
          :id="`topic_${topic.number}`"
          class="fr-m-0 topic-heading"
          tabindex="-1"
        >
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

      <div class="fr-grid-row fr-grid-row--right">
        <TopLink target="audit-tabs" />
      </div>
    </section>
  </template>

  <div aria-live="polite" role="alert">
    <section v-if="!store.filteredTopics.length">
      <h2 class="fr-h6 fr-mb-3v">
        {{ noResults.title }}
      </h2>
      <ul v-if="Array.isArray(noResults.description)">
        <li v-for="el in noResults.description">{{ el }}</li>
      </ul>
      <p v-else>{{ noResults.description }}</p>

      <template
        v-if="
          store.hasNoResultsFromSearch &&
          !store.hideEvaluatedCriteria &&
          !store.hasNoResultsFromEvaluated &&
          !store.hasNoResultsFromComplianceLevel
        "
      >
        <p><strong>Suggestions :</strong></p>
        <ul>
          <li>Vérifiez l’orthographe des termes de recherche</li>
          <li>Essayez un autre mot</li>
        </ul>
      </template>
    </section>
  </div>
</template>

<style scoped>
.optional-notice {
  color: var(--text-mention-grey);
}

.page-url {
  text-align: right;
}

.page-url,
.transervse-elements {
  min-height: 2.75rem;
}

.topic-header {
  align-items: center;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
}

.topic-heading {
  color: var(--text-action-high-blue-france);
  scroll-margin: 7.5rem;
}
</style>
