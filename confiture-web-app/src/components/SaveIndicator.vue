<script setup lang="ts">
import { ref, watch } from "vue";
import { debounce } from "lodash-es";

import { useResultsStore } from "../store";
import Dropdown from "./Dropdown.vue";

const resultsStore = useResultsStore();

const isLoading = ref(resultsStore.isLoading);

const unsetIsLoadingDebounced = debounce(() => {
  isLoading.value = false;
}, 500);

watch(
  () => resultsStore.isLoading,
  (newValue) => {
    if (newValue) {
      isLoading.value = true;
    } else {
      unsetIsLoadingDebounced();
    }
  }
);
</script>

<template>
  <Dropdown
    :title="isLoading ? 'Enregistrement...' : 'Enregistré'"
    align-left
    icon-left
    :button-props="{
      class: `indicator fr-btn--tertiary-no-outline ${
        isLoading ? 'fr-icon-refresh-line' : 'fr-icon-success-line'
      }`,
      'aria-live': 'polite',
      role: 'alert',
    }"
  >
    <p class="fr-text--sm fr-mb-1v">
      <strong>Ara enregistre automatiquement votre travail </strong>
    </p>
    <p class="fr-text--sm fr-m-0">
      Toutes les modifications ont été enregistrées avec succès.
    </p>
  </Dropdown>
</template>
