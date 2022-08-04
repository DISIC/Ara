<script setup lang="ts">
import { ref } from "vue";

defineProps<{
  resultsCount: number;
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

  <p class="fr-label fr-text--bold fr-mt-4w fr-mb-2w" for="">
    Thématiques de critères
  </p>
</template>
