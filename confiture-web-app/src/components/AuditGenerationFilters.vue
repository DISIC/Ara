<script setup lang="ts">
import { computed, watch, nextTick } from "vue";
import { ref } from "vue";
import { useFiltersStore, useResultsStore } from "../store";

defineProps<{
  topics: { title: string; number: number; value: number }[];
}>();

const emit = defineEmits<{
  (e: "toggle-filters", payload: boolean): void;
}>();

const filterStore = useFiltersStore();
const resultStore = useResultsStore();

const resultsCount = computed(() =>
  filterStore.filteredTopics
    .map((t) => t.criteria.length)
    .reduce((total, length) => (total += length), 0)
);

const search = ref("");
const searchInputRef = ref<HTMLInputElement>();

function onGlobalReset() {
  filterStore.$reset();

  search.value = "";
  searchInputRef.value?.focus();
}

function onSearchReset() {
  search.value = "";
  filterStore.search = "";

  searchInputRef.value?.focus();
}

function submit() {
  filterStore.search = search.value;
}

const showFilters = ref(true);
const hideFiltersRef = ref<HTMLButtonElement>();
const displayFiltersRef = ref<HTMLButtonElement>();

async function hideFilters() {
  showFilters.value = false;
  emit("toggle-filters", false);
  await nextTick();
  displayFiltersRef.value?.focus();
}

async function displayFilters() {
  showFilters.value = true;
  emit("toggle-filters", true);
  await nextTick();
  hideFiltersRef.value?.focus();
}

watch(
  () => filterStore.hideEvaluatedCriteria,
  () => filterStore.updateEvaluatedCriteria()
);
</script>

<template>
  <button
    v-if="!showFilters"
    ref="displayFiltersRef"
    type="button"
    class="fr-btn fr-btn--sm fr-btn--tertiary fr-icon-arrow-right-s-line-double toggle-column-button"
    @click="displayFilters"
  >
    <span class="sr-only">Afficher la colonne des filtres</span>
  </button>
  <template v-else>
    <div class="heading-wrapper">
      <h2 class="fr-h4 fr-mb-0">Filtres</h2>
      <button
        ref="hideFiltersRef"
        type="button"
        class="fr-btn fr-btn--sm fr-btn--tertiary fr-icon-arrow-left-s-line-double toggle-column-button"
        @click="hideFilters"
      >
        <span class="sr-only">Cacher la colonne des filtres</span>
      </button>
    </div>
    <button
      v-if="filterStore.search || filterStore.hideEvaluatedCriteria"
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
      <p v-if="filterStore.search" class="fr-mt-2w fr-mb-1w">
        {{ resultsCount }} {{ resultsCount !== 1 ? "résultats" : "résultat" }}
      </p>
      <!-- FIXME: can't change color on dismissable tags. "fr-tag--blue-france" -->
    </div>
    <button
      v-if="filterStore.search"
      class="fr-tag fr-tag--dismiss"
      :aria-label="`Retirer la recherche ${filterStore.search}`"
      @click="onSearchReset"
    >
      {{ filterStore.search }}
    </button>

    <div class="fr-my-4w fr-py-4w evaluated-criteria-filter">
      <div class="fr-checkbox-group">
        <input
          id="hide-evaluated-criteria"
          v-model="filterStore.hideEvaluatedCriteria"
          type="checkbox"
        />
        <label class="fr-label" for="hide-evaluated-criteria">
          Masquer critères évalués
          <template v-if="resultStore.testedCriteriumCount">
            ({{ resultStore.testedCriteriumCount }})
          </template>
        </label>
      </div>
      <button
        v-if="
          filterStore.hideEvaluatedCriteria &&
          filterStore.newEvaluatedCriteria.length
        "
        class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline fr-mt-2w"
        @click="filterStore.updateEvaluatedCriteria"
      >
        Mettre à jour critères masqués ({{
          filterStore.newEvaluatedCriteria.length
        }})
      </button>

      <div class="fr-checkbox-group fr-mt-4w">
        <input
          id="hide-tests-and-references"
          v-model="filterStore.hideTestsAndReferences"
          type="checkbox"
        />
        <label class="fr-label" for="hide-tests-and-references">
          Masquer les tests et références
        </label>
      </div>
    </div>

    <div class="fr-form-group">
      <p id="anchor-nav-title" class="fr-text--regular fr-text--bold fr-mb-1w">
        Thématiques de critères
      </p>
      <nav aria-labelledby="anchor-nav-title">
        <ol class="fr-pl-0 fr-ml-0">
          <li
            v-for="(topic, i) in topics"
            :key="i"
            class="topic-filter-item"
            :style="{ '--topic-filter-value': topic.value + '%' }"
          >
            <a
              :href="`#${topic.number}`"
              class="fr-py-1w fr-mb-2v topic-filter-anchor"
            >
              <span>{{ topic.number }}. {{ topic.title }}</span>
              <span class="fr-text--sm fr-m-0">{{ topic.value }}%</span>
              <div class="topic-filter-progress" />
            </a>
          </li>
        </ol>
      </nav>
    </div>
  </template>
</template>

<style scoped>
.heading-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.toggle-column-button:focus {
  outline: 2px solid #0a76f6;
  outline-offset: -2px;
}

.evaluated-criteria-filter {
  border-top: 1px solid var(--border-default-grey);
  border-bottom: 1px solid var(--border-default-grey);
}

.topic-filter-item::marker {
  content: none;
}

.topic-filter-anchor {
  background: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.25rem 0;
}

.topic-filter-progress {
  background-color: var(--background-contrast-grey);
  position: relative;
  height: 0.25rem;
  flex-basis: 100%;
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
