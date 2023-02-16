<script setup lang="ts">
import { computed, watch } from "vue";
import { ref } from "vue";
import { useFiltersStore } from "../store";

defineProps<{
  topics: { title: string; number: number; value: number }[];
}>();

const store = useFiltersStore();

const resultsCount = computed(() =>
  store.filteredTopics
    .map((t) => t.criteria.length)
    .reduce((total, length) => (total += length), 0)
);

const search = ref("");
const searchInputRef = ref<HTMLInputElement>();

function onGlobalReset() {
  store.$reset();

  search.value = "";
  searchInputRef.value?.focus();
}

function onSearchReset() {
  search.value = "";
  store.search = "";

  searchInputRef.value?.focus();
}

function submit() {
  store.search = search.value;
}

watch(
  () => store.hideEvaluatedCriteria,
  () => store.updateEvaluatedCriteria()
);
</script>

<template>
  <h2 class="fr-h4 fr-mb-2w">Filtres</h2>
  <button
    v-if="store.search || store.topics.length || store.hideEvaluatedCriteria"
    class="fr-btn fr-btn--tertiary-no-outline fr-icon-refresh-line fr-btn--icon-right fr-mb-4w"
    @click="onGlobalReset"
  >
    Réinitialiser
  </button>
  <form @submit.prevent="submit">
    <label class="fr-label fr-text--bold fr-mb-1w" for="filters-search">
      Rechercher par mots clés
    </label>
    <div class="fr-search-bar">
      <input
        id="filters-search"
        ref="searchInputRef"
        v-model="search"
        class="fr-input"
        placeholder="Rechercher"
        type="search"
      />
      <button type="submit" class="fr-btn" title="Rechercher">
        Rechercher
      </button>
    </div>
  </form>

  <div role="alert" aria-live="polite">
    <p v-if="store.search" class="fr-mt-2w fr-mb-1w">
      {{ resultsCount }} {{ resultsCount !== 1 ? "résultats" : "résultat" }}
    </p>
    <!-- FIXME: can't change color on dismissable tags. "fr-tag--blue-france" -->
  </div>
  <button
    v-if="store.search"
    class="fr-tag fr-tag--dismiss"
    :aria-label="`Retirer la recherche ${store.search}`"
    @click="onSearchReset"
  >
    {{ store.search }}
  </button>

  <div class="fr-my-4w fr-py-4w evaluated-criteria-filter">
    <div class="fr-checkbox-group">
      <input
        id="hide-evaluated-criteria"
        v-model="store.hideEvaluatedCriteria"
        type="checkbox"
      />
      <label class="fr-label" for="hide-evaluated-criteria">
        Masquer critères évalués (X)
      </label>
    </div>
    <button
      v-if="store.hideEvaluatedCriteria && store.newEvaluatedCriteria.length"
      class="fr-btn fr-btn--tertiary-no-outline fr-mt-2w"
      @click="store.updateEvaluatedCriteria"
    >
      Mettre à jour critères masqués ({{ store.newEvaluatedCriteria.length }})
    </button>
  </div>

  <div class="fr-form-group">
    <fieldset class="fr-fieldset">
      <legend class="fr-fieldset__legend fr-text--regular fr-text--bold">
        Thématiques de critères
      </legend>
      <ol class="fr-fieldset__content fr-pl-0">
        <li
          v-for="(topic, i) in topics"
          :key="i"
          class="fr-mb-3w topic-filter"
          :style="{ '--topic-filter-value': topic.value + '%' }"
        >
          <div class="fr-checkbox-group topic-filter-checkbox">
            <input
              :id="`topic-filter-${i}`"
              v-model="store.topics"
              type="checkbox"
              :value="topic.number"
            />
            <label class="fr-label fr-pb-0" :for="`topic-filter-${i}`">
              {{ topic.number }}. {{ topic.title }}
            </label>
          </div>
          <span class="fr-text--sm fr-m-0 fr-ml-1w topic-filter-value"
            >{{ topic.value }}%</span
          >
          <div class="topic-filter-progress" />
        </li>
      </ol>
    </fieldset>
  </div>
</template>

<style scoped>
.evaluated-criteria-filter {
  border-top: 1px solid var(--border-default-grey);
  border-bottom: 1px solid var(--border-default-grey);
}
.topic-filter {
  --topic-filter-offset: 2rem;

  display: grid;
  gap: 0.5rem 0;
  grid-template-columns: var(--topic-filter-offset) 1fr auto;
  grid-template-rows: 1fr 0.25rem;
  grid-template-areas:
    "checkbox checkbox value"
    "... progress progress";
}

.topic-filter-checkbox {
  grid-area: checkbox;
}

.topic-filter-value {
  grid-area: value;
  /* TODO: only FF supports this but degrades gracefully, is ok? */
  align-self: last baseline;
}

.topic-filter-progress {
  grid-area: progress;
  background-color: var(--background-contrast-grey);
  position: relative;
}

.topic-filter-progress::after {
  background-color: var(--background-flat-success);
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  transition: width 1s ease;
  width: var(--topic-filter-value);
}
</style>
