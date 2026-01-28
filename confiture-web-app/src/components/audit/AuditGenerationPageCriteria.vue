<script setup lang="ts">
import { computed, ref } from "vue";

import { useTopicAccordions } from "../../composables/useTopicAccordions";
import { useAuditStore, useFiltersStore, useResultsStore } from "../../store";
import { AuditPage } from "../../types";
import TopLink from "../ui/TopLink.vue";
import AuditGenerationCriterium from "./AuditGenerationCriterium.vue";
import NotApplicableSwitch from "./NotApplicableSwitch.vue";
import TransverseElementsList from "./TransverseElementsList.vue";

const props = defineProps<{
  page: AuditPage;
  auditUniqueId: string;
}>();

const store = useFiltersStore();
const auditStore = useAuditStore();
const resultsStore = useResultsStore();

const transversePageId = computed(() => {
  return auditStore.currentAudit?.transverseElementsPage.id;
});

const noResults = computed(() => {
  if (store.hasNoResultsFromEvaluated) {
    return {
      title: "Tous les critères évalués ont été masqués",
      description:
        "Veuillez décocher le filtre \"Masquer les critères évalués\" pour afficher de nouveau les critères."
    };
  } else if (store.hasNoResultsFromComplianceLevel) {
    return {
      title: "Aucun critère ne correspond à vos filtres",
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
        "Veuillez décocher le filtre \"Masquer les critères évalués\" pour afficher de nouveau les critères."
    };
  }
});

const notApplicableSwitchRefs =
  ref<Record<number, InstanceType<typeof NotApplicableSwitch> | null>>({});

// put ref in notApplicableSwitchRefs record based on given topic number
const refFn =
  (topicNumber: number) =>
    (el: any) =>
      notApplicableSwitchRefs.value[topicNumber] =
        el as InstanceType<typeof NotApplicableSwitch>;

// const transverseElementsPageId =
//   ref(auditStore.currentAudit?.transverseElementsPage.id);

// Hide or show topic criteria
/**
 * {
 *  '12345': Set [1, 2],
 *  '12346': Set [1, 3, 12]
 * }
 */
// const hiddenTopics = ref<Record<string, Set<number>>>({
//   ...(transverseElementsPageId.value
//     ? { [transverseElementsPageId.value]: new Set([]) }
//     : {}
//   ),
//   ...Object.fromEntries(
//     new Map(auditStore.currentAudit?.pages.map(p => [p.id, new Set([])]))
//   )
// });

const {
  toggleTopicAccordionStatus,
  saveTopicAccordionStatusToLocalStorage
} = useTopicAccordions();

function toggleTopic(value: boolean, topic: number) {
  toggleTopicAccordionStatus(props.auditUniqueId, props.page.id, topic, !value);
  saveTopicAccordionStatusToLocalStorage();

  // if (value) {
  //   hiddenTopics.value[props.page.id].delete(topic);
  // } else {
  //   hiddenTopics.value[props.page.id].add(topic);
  // }
}

// Hide not applicable topics on load
// onMounted(() => {
//   store.filteredTopics.forEach(t => {
//     if (resultsStore.topicIsNotApplicable(props.page.id, t.number)) {
//       hiddenTopics.value[props.page.id].add(t.number);
//       auditStore.currentAudit?.pages.forEach(p => {
//         hiddenTopics.value[p.id].add(t.number);
//       });
//     }
//   });
// });

const { topicIsHidden } = useTopicAccordions();
</script>

<template>
  <!-- TODO: handle empty state -->
  <h2 class="fr-sr-only">{{ page.name }}</h2>

  <div v-if="page.id !== transversePageId" class="fr-mb-3w page-url">
    <a class="fr-link fr-link--sm" :href="page.url" target="_blank" rel="noreferrer noopener">
      {{ page.url }} <span class="fr-sr-only">(nouvelle fenêtre)</span>
    </a>
  </div>

  <TransverseElementsList v-else class="fr-mb-3w transverse-elements" />

  <template v-if="store.filteredTopics.length">
    <section
      v-for="topic in store.filteredTopics"
      :key="topic.number"
      class="fr-mb-6w topic-section"
    >
      <div class="fr-mb-3w topic-header">
        <h3
          :id="`topic_${topic.number}`"
          :class="[
            'fr-my-0 fr-mr-auto topic-heading',
            {
              'topic-heading--hidden': resultsStore.topicIsNotApplicable(
                page.id,
                topic.number
              )
            }
          ]"
          tabindex="-1"
        >
          {{ topic.number }}. {{ topic.topic }}
        </h3>
        <NotApplicableSwitch
          :ref="refFn(topic.number)"
          class="na-toggle"
          :page-id="page.id"
          :topic-number="topic.number"
          :topic-title="topic.topic"
          @toggle="toggleTopic(!$event, topic.number)"
        />
        <button
          class="fr-btn fr-btn--secondary fr-btn--sm toggle-topic-button"
          :class="topicIsHidden(auditUniqueId, page.id, topic.number) ? 'fr-icon-arrow-down-s-line' : 'fr-icon-arrow-up-s-line'"
          @click="toggleTopic(
            topicIsHidden(auditUniqueId, page.id, topic.number),
            topic.number
          )"
        >
          {{ topicIsHidden(auditUniqueId, page.id, topic.number) ? 'Afficher' : 'Masquer' }} les critères de la thématique {{ topic.topic }}
        </button>
      </div>
      <template
        v-if="!topicIsHidden(auditUniqueId, page.id, topic.number)"
      >
        <ol class="fr-p-0 fr-m-0">
          <AuditGenerationCriterium
            v-for="(criterium, i) in topic.criteria"
            :key="criterium.criterium.number"
            :page="page"
            :class="{ 'fr-mb-3w': i !== topic.criteria.length - 1 }"
            :criterium="criterium.criterium"
            :topic-number="topic.number"
            :audit-unique-id="auditUniqueId"
          />
        </ol>

        <div class="fr-grid-row fr-grid-row--right">
          <TopLink target="audit-tabs" top-margin="1.5rem" />
        </div>
      </template>
    </section>
  </template>

  <div aria-live="polite" role="alert">
    <section v-if="!store.filteredTopics.length">
      <h2 class="fr-h6 fr-mb-3v">
        {{ noResults.title }}
      </h2>
      <ul v-if="Array.isArray(noResults.description)">
        <li v-for="(el, i) in noResults.description" :key="i">{{ el }}</li>
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
        <p><strong>Suggestions :</strong></p>
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
  min-height: 2.75rem;
}

.topic-section {
  container-type: inline-size;
}

.topic-header {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 1rem;
  justify-content: end;
  align-items: center;
  grid-template-areas: "title na toggle";

  @container (width < 48rem) {
    justify-content: start;
    grid-template-columns: 1fr auto;
    grid-template-areas:
      "title toggle"
      "na na";
  }
}

.topic-heading {
  color: var(--text-action-high-blue-france);
  scroll-margin: 7.5rem;
  grid-area: title;

  &.topic-heading--hidden {
    color: var(--grey-625-425);
  }
}

.na-toggle {
  grid-area: na;
  justify-self: start;
}

.toggle-topic-button {
  grid-area: toggle;
}
</style>
