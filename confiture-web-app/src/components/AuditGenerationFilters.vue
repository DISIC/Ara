<script setup lang="ts">
import { ref } from "vue";

defineProps<{
  resultsCount: number;
  topics: { title: string; value: number }[];
}>();
const emit = defineEmits(["search"]);

const search = ref("");
const currentSearch = ref("");
const searchInputRef = ref<HTMLInputElement>();

async function onReset() {
  onSearchReset();
}

async function onSearchReset() {
  search.value = "";
  currentSearch.value = "";
  emit("search", search.value);
  searchInputRef.value?.focus();
}

async function onSearch() {
  currentSearch.value = search.value;
  emit("search", search.value);
}
</script>

<template>
  <h2 class="fr-h4 fr-mb-2w">Filtres</h2>
  <button
    v-if="currentSearch"
    class="fr-btn fr-btn--tertiary-no-outline fr-icon-refresh-line fr-btn--icon-right fr-mb-4w"
    @click="onReset"
  >
    Réinitialiser
  </button>
  <label class="fr-label fr-text--bold fr-mb-1w" for="filters-search">
    Rechercher par mots clés
  </label>
  <div class="fr-search-bar" role="search">
    <input
      id="filters-search"
      ref="searchInputRef"
      v-model="search"
      class="fr-input"
      placeholder="Rechercher"
      type="search"
    />
    <button class="fr-btn" title="Rechercher" @click="onSearch">
      Rechercher
    </button>
  </div>

  <template v-if="currentSearch">
    <p class="fr-mt-2w fr-mb-1w">
      {{ resultsCount }} résultat<template v-if="resultsCount !== 1"
        >s</template
      >
    </p>
    <!-- FIXME: can't change color on dismissable tags. "fr-tag--blue-france" -->
    <button
      class="fr-tag fr-tag--dismiss"
      :aria-label="`Retirer la recherche ${currentSearch}`"
      @click="onSearchReset"
    >
      {{ currentSearch }}
    </button>
  </template>

  <div class="fr-form-group fr-mt-4w">
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
            <input :id="`topic-filter-${i}`" type="checkbox" />
            <label class="fr-label fr-pb-0" :for="`topic-filter-${i}`">
              {{ i + 1 }}. {{ topic.title }}
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
