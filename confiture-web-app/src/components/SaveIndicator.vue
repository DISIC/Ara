<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch, computed } from "vue";
import { debounce } from "lodash-es";

import { useResultsStore } from "../store";
import Dropdown from "./Dropdown.vue";

const dropdownTitle = computed(() => {
  if (isLoading.value) {
    return "Enregistrement...";
  }
  if (isOffline.value) {
    return "Enregistrement impossible";
  }

  return "Enregistré";
});

const dropdownIcon = computed(() => {
  if (isLoading.value) {
    return "fr-icon-refresh-line";
  }
  if (isOffline.value) {
    return "fr-icon-warning-line";
  }

  return "fr-icon-success-line";
});

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

/*
Make the indicator `fixed` whenever the user scrolls past the sentinel div.
*/

const isScrolled = ref(false);
const sentinelRef = ref<HTMLDivElement>();

function onObservation(entries: IntersectionObserverEntry[]) {
  const { isIntersecting, boundingClientRect } = entries[0];
  isScrolled.value =
    !isIntersecting &&
    // dont "fix" the indicator when scrolling upwards past the sentinel
    boundingClientRect.top <= 40;
}

const observer = new IntersectionObserver(onObservation, {
  rootMargin: "-40px",
});

onMounted(() => {
  if (sentinelRef.value) {
    observer.observe(sentinelRef.value);
  }
});

/* Show an alert when the app is offline */

const isOffline = ref(false);

function onOnline() {
  isOffline.value = false;
}

function onOffline() {
  isOffline.value = true;
}

onMounted(() => {
  window.addEventListener("online", onOnline);
  window.addEventListener("offline", onOffline);
});

onBeforeUnmount(() => {
  window.removeEventListener("online", onOnline);
  window.removeEventListener("offline", onOffline);
});
</script>

<template>
  <div>
    <div :class="{ 'is-scrolled': isScrolled }">
      <!-- <div
        v-if="isOffline"
        class="fr-alert fr-alert--error fr-mb-3w"
        :class="{ 'fr-mt-4w': isScrolled }"
      >
        <h3 class="fr-alert__title">Tentative de connexion...</h3>
        <p>
          Vous êtes actuellement hors connexion. Veuillez vérifier votre
          connexion internet.
        </p>
      </div> -->

      <Dropdown
        :title="dropdownTitle"
        align-left
        icon-left
        :button-props="{
          class: `indicator fr-btn--tertiary-no-outline ${dropdownIcon}`,
          'aria-live': 'polite',
          role: 'alert',
          style: isOffline ? 'color: var(--text-default-error);' : undefined,
        }"
      >
        <p class="fr-text--sm fr-mb-1v">
          <strong>Ara enregistre automatiquement votre travail </strong>
        </p>
        <p class="fr-text--sm fr-m-0">
          {{
            isOffline
              ? "Les modifications n’ont pas pu être enregistrées."
              : "Toutes les modifications ont été enregistrées avec succès."
          }}
        </p>
      </Dropdown>
    </div>

    <div ref="sentinelRef" />
  </div>
</template>

<style scoped>
.is-scrolled {
  position: fixed;
  top: 0;
  background: var(--background-default-grey);
  z-index: 3;
  width: calc(
    78rem - calc(1.5rem * 2)
  ); /* main wrapper width - left and right padding */
}
</style>
