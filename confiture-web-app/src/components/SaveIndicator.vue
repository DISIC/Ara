<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
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
</script>

<template>
  <div>
    <div :class="{ 'is-scrolled': isScrolled }">
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
