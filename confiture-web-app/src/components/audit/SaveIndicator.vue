<script setup lang="ts">
import { debounce } from "lodash-es";
import { computed, ref, watch } from "vue";

import { useResultsStore, useSystemStore } from "../../store";
import Dropdown from "../ui/Dropdown.vue";

/* Change the saving status in a way that it wont "flicker" */

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

/* Show an alert when the app is offline */

const systemStore = useSystemStore();

const dropdownTitle = computed(() => {
  if (isLoading.value) {
    return "Enregistrement...";
  }
  if (!systemStore.isOnline) {
    return "Enregistrement impossible";
  }

  return "Enregistré";
});

const dropdownMainText = computed(() => {
  if (isLoading.value) {
    return "Modifications en cours d’enregistrement...";
  }
  if (!systemStore.isOnline) {
    return "L’enregistrement de vos modifications est impossible hors connexion. Veuillez vérifier votre connexion internet.";
  }
  return "Ara enregistre automatiquement votre travail";
});

const dropdownIcon = computed(() => {
  if (isLoading.value) {
    return "fr-icon-refresh-line";
  }
  if (!systemStore.isOnline) {
    return "fr-icon-warning-line";
  }

  return "fr-icon-success-line";
});

/* Display the time since last successful save */

const relativeLastSaveDate = ref<string>();

/**
 *
 * @param seconds
 */
function formatInterval(seconds: number) {
  if (seconds < 60) {
    return `il y a ${seconds} secondes`;
  } else if (seconds < 60 * 60) {
    return `il y a ${Math.floor(seconds / 60)} min`;
  } else {
    const hours = Math.floor(seconds / (60 * 60));
    const minutes = Math.floor((seconds - hours * 60 * 60) / 60);
    return `il y a ${hours} h ${minutes} m`;
  }
}

setInterval(() => {
  const timestamp = resultsStore.lastRequestSuccessEnd;

  if (!timestamp) {
    return;
  }

  var seconds = Math.round((Date.now() - timestamp) / 1000);
  relativeLastSaveDate.value = formatInterval(seconds);
}, 1000);
</script>

<template>
  <Dropdown
    :title="dropdownTitle"
    align-left
    icon-left
    :button-props="{
      class: `indicator fr-btn--tertiary-no-outline ${dropdownIcon}`,
      'aria-live': !systemStore.isOnline ? 'assertive' : 'polite',
      role: 'alert',
      style: !systemStore.isOnline
        ? 'color: var(--text-default-error);'
        : undefined
    }"
  >
    <p class="fr-text--sm fr-mb-1v">
      {{ dropdownMainText }}
    </p>

    <p v-if="relativeLastSaveDate" class="fr-text--xs fr-m-0">
      Dernier enregistrement {{ relativeLastSaveDate }}
    </p>
  </Dropdown>
</template>
