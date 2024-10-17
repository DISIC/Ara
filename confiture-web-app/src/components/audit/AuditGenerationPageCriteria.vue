<script setup lang="ts">
import { computed, ref } from "vue";

import { useAuditStore, useFiltersStore } from "../../store";
import { AuditPage } from "../../types";
import TopLink from "../ui/TopLink.vue";
import AuditGenerationCriterium from "./AuditGenerationCriterium.vue";
import NotApplicableSwitch from "./NotApplicableSwitch.vue";

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
        'Veuillez décocher le filtre "Masquer critères évalués" pour afficher de nouveau les critères.'
    };
  } else if (store.hasNoResultsFromComplianceLevel) {
    return {
      title: "Aucun résultat ne correspond à votre recherche",
      description:
        'Veuillez sélectionner un filtre "Critères" comportant au moins un critère.'
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
        'Veuillez décocher le filtre "Masquer critères évalués" pour afficher de nouveau les critères.'
    };
  }
});

// TODO: remove this alert in 3 months (16/10/2024)
const topicNameRefs = ref<HTMLHeadingElement[]>();

async function hideTransverseAlert() {
  showTransverseAlert.value = false;
  localStorage.setItem("ara:hide-transverse-alert", "true");
  topicNameRefs.value?.[0].focus();
}

const showTransverseAlert = ref(
  localStorage.getItem("ara:hide-transverse-alert") !== "true"
);
</script>

<template>
  <!-- TODO: handle empty state -->
  <div v-if="showTransverseAlert" class="fr-alert fr-alert--info fr-mb-4w">
    <h3 class="fr-alert__title">
      Nouveauté : gestion des éléments transverses
    </h3>
    <p>
      L'interrupteur "Sur toutes les pages" est remplacé par l'onglet "Éléments
      transverses", qui vous permet d’évaluer les éléments communs à toutes les
      pages : en-tête, pied de page...
    </p>
    <button
      class="fr-btn--close fr-btn"
      title="Masquer le message"
      @click="hideTransverseAlert"
    >
      Masquer le message
    </button>
  </div>

  <div v-if="page.id !== transversePageId" class="fr-mb-2w page-url">
    <a class="fr-link fr-link--sm" :href="page.url" target="_blank">
      {{ page.url }} <span class="fr-sr-only">(nouvelle fenêtre)</span>
    </a>
  </div>

  <template v-if="store.filteredTopics.length">
    <section
      v-for="topic in store.filteredTopics"
      :key="topic.number"
      class="fr-mb-6w"
    >
      <div class="fr-mb-3w topic-header">
        <h3
          :id="topic.number"
          ref="topicNameRefs"
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
.optional-notice {
  color: var(--text-mention-grey);
}

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
  scroll-margin: 7.5rem;
}
</style>
