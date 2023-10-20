<script setup lang="ts">
import { computed } from "vue";

import { AuditPage } from "../types";
import AuditGenerationCriterium from "./AuditGenerationCriterium.vue";

import { useFiltersStore } from "../store";
import NotApplicableSwitch from "./NotApplicableSwitch.vue";

defineProps<{
  page: AuditPage;
  auditUniqueId: string;
}>();

const store = useFiltersStore();

const noResults = computed(() => {
  if (store.hasNoResultsFromEvaluated) {
    return {
      title: "Tous les critères évalués ont été masqués",
      description:
        'Veuillez décocher le filtre "Masquer critères évalués" pour afficher de nouveau les critères.',
    };
  } else if (store.hasNoResultsFromComplianceLevel) {
    return {
      title: "Aucun résultat ne correspond à votre recherche",
      description:
        'Veuillez sélectionner un filtre "Critères" comportant au moins un critère.',
    };
  } else if (store.hasNoResultsFromSearch && !store.hideEvaluatedCriteria) {
    return {
      title: "Aucun résultat ne correspond à votre recherche",
      description:
        "Le système de recherche par mots clés s'applique uniquement à l’intitulé des critères.",
    };
  } else {
    return {
      title: "Tous les critères évalués ont été masqués",
      description:
        'Veuillez décocher le filtre "Masquer critères évalués" pour afficher de nouveau les critères.',
    };
  }
});
</script>

<template>
  <!-- TODO: handle empty state -->
  <div class="fr-mb-2w page-url">
    <a class="fr-link fr-link--sm" :href="page.url" target="_blank">
      {{ page.url }} <span class="sr-only">(nouvelle fenêtre)</span>
    </a>
  </div>

  <template v-if="store.filteredTopics.length">
    <section
      v-for="topic in store.filteredTopics"
      :key="topic.number"
      class="fr-mb-6w"
    >
      <div class="fr-mb-3w topic-header">
        <h3 :id="topic.number" class="fr-m-0 topic-heading">
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
        <a
          class="fr-link fr-icon-arrow-up-fill fr-link--icon-left"
          href="#main"
        >
          Haut de page
        </a>
      </div>
    </section>
  </template>

  <div aria-live="polite" role="alert">
    <section v-if="!store.filteredTopics.length">
      <h2 class="fr-h6 fr-mb-1w">
        {{ noResults.title }}
      </h2>
      <p>{{ noResults.description }}</p>

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
.page-url {
  text-align: right;
}

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
