<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";

import { useFiltersStore, useResultsStore } from "../../store";
import { CriteriumResultStatus } from "../../types";
import { pluralize } from "../../utils";

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

const compliantCount = computed(
  () =>
    resultStore.allResults?.filter(
      (r) => r.status === CriteriumResultStatus.COMPLIANT
    ).length
);
const notCompliantCount = computed(
  () =>
    resultStore.allResults?.filter(
      (r) => r.status === CriteriumResultStatus.NOT_COMPLIANT
    ).length
);
const notApplicableCount = computed(
  () =>
    resultStore.allResults?.filter(
      (r) => r.status === CriteriumResultStatus.NOT_APPLICABLE
    ).length
);
</script>

<template>
  <button
    v-if="!showFilters"
    ref="displayFiltersRef"
    type="button"
    class="fr-btn fr-btn--sm fr-btn--tertiary fr-icon-arrow-right-s-line-double toggle-column-button fr-mr-3v"
    @click="displayFilters"
  >
    <span class="fr-sr-only">Afficher la colonne des filtres</span>
  </button>
  <template v-else>
    <div class="fr-mb-3w heading-wrapper">
      <h2 class="fr-h6 fr-mb-0">Filtres</h2>
      <button
        ref="hideFiltersRef"
        type="button"
        class="fr-btn fr-btn--sm fr-btn--tertiary fr-icon-arrow-left-s-line-double toggle-column-button"
        @click="hideFilters"
      >
        <span class="fr-sr-only">Cacher la colonne des filtres</span>
      </button>
    </div>
    <button
      v-if="
        filterStore.search ||
        filterStore.hideEvaluatedCriteria ||
        filterStore.complianceLevels.length
      "
      class="fr-btn fr-btn--tertiary-no-outline fr-icon-refresh-line fr-btn--icon-right fr-mb-4w"
      @click="onGlobalReset"
    >
      Réinitialiser
    </button>

    <form @submit.prevent="submit">
      <div class="fr-search-bar" role="search">
        <label class="fr-label" for="filters-search"
          >Recherche par mots clés</label
        >
        <input
          id="filters-search"
          ref="searchInputRef"
          v-model="search"
          class="fr-input"
          placeholder="Rechercher un critère"
          type="search"
        />
        <button type="submit" class="fr-btn" title="Rechercher">
          Rechercher
        </button>
      </div>
    </form>

    <div role="alert" aria-live="polite">
      <p v-if="filterStore.search" class="fr-mt-2w fr-mb-1w">
        {{ resultsCount }}
        {{ pluralize("résultat", "résultats", resultsCount) }}
      </p>
    </div>
    <button
      v-if="filterStore.search"
      class="fr-tag fr-tag--dismiss"
      :aria-label="`Retirer la recherche ${filterStore.search}`"
      @click="onSearchReset"
    >
      {{ filterStore.search }}
    </button>

    <div class="fr-mt-4w fr-mb-3w">
      <div class="fr-checkbox-group">
        <input
          id="hide-evaluated-criteria"
          v-model="filterStore.hideEvaluatedCriteria"
          type="checkbox"
        />
        <label class="fr-label" for="hide-evaluated-criteria">
          Masquer les critères évalués
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

    <fieldset
      id="checkboxes"
      class="fr-fieldset"
      aria-labelledby="complianceLevel"
    >
      <legend
        id="complianceLevel"
        class="fr-fieldset__legend--regular fr-fieldset__legend fr-text--bold"
      >
        Critères
      </legend>
      <div class="fr-fieldset__element">
        <div class="fr-checkbox-group">
          <input
            id="compliance-level-compliant"
            v-model="filterStore.complianceLevels"
            :value="CriteriumResultStatus.COMPLIANT"
            type="checkbox"
          />
          <label class="fr-label" for="compliance-level-compliant">
            Conforme ({{ compliantCount }})
          </label>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-checkbox-group">
          <input
            id="compliance-level-not-compliant"
            v-model="filterStore.complianceLevels"
            :value="CriteriumResultStatus.NOT_COMPLIANT"
            type="checkbox"
          />
          <label class="fr-label" for="compliance-level-not-compliant">
            Non conforme ({{ notCompliantCount }})
          </label>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-checkbox-group">
          <input
            id="compliance-level-not-applicable"
            v-model="filterStore.complianceLevels"
            :value="CriteriumResultStatus.NOT_APPLICABLE"
            type="checkbox"
          />
          <label class="fr-label" for="compliance-level-not-applicable">
            Non applicable ({{ notApplicableCount }})
          </label>
        </div>
      </div>
    </fieldset>

    <div class="fr-form-group">
      <h2 id="anchor-nav-title" class="fr-h6 fr-mb-2w">Thématiques</h2>
      <nav aria-labelledby="anchor-nav-title">
        <ol class="fr-pl-0 fr-ml-0">
          <li
            v-for="(topic, i) in topics"
            :key="i"
            class="topic-filter-item"
            :style="{ '--topic-filter-value': topic.value + '%' }"
          >
            <RouterLink
              :to="{ hash: `#topic_${topic.number}` }"
              class="fr-py-1w fr-px-1w fr-mb-2v topic-filter-anchor"
            >
              <span>{{ topic.number }}.</span>
              <span>{{ topic.title }}</span>
              <span class="fr-text--sm fr-m-0 topic-filter-value"
                >{{ topic.value }}%</span
              >
              <div class="topic-filter-progress" />
            </RouterLink>
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
}

.toggle-column-button:focus-visible {
  outline: 2px solid var(--dsfr-outline);
  outline-offset: -2px;
}

.topic-filter-item::marker {
  content: none;
}

.topic-filter-anchor {
  background: none;
  display: grid;
  gap: 0.25rem 0;
  grid-template-columns: 3ch 1fr auto;
  grid-template-rows: auto 0.25rem;
}

.topic-filter-anchor:hover {
  background: var(--background-alt-grey);
}

.topic-filter-value {
  align-self: last baseline;
}

.topic-filter-progress {
  background-color: var(--background-contrast-grey);
  position: relative;
  grid-column: 1 / -1;
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
