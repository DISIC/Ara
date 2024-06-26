<script lang="ts" setup>
import { ref } from "vue";

import { useUniqueId } from "../../composables/useUniqueId";

defineProps<{
  /** Label of the accordion toggle button. */
  title: string;
  /** When the accordion is disclosed, change the background color. */
  discloseColor?: string;
}>();

const showContent = ref(false);
const uniqueId = useUniqueId();

function onConceal() {
  showContent.value = false;
}

function onDisclose() {
  showContent.value = true;
}
</script>

<template>
  <div
    class="fr-accordion"
    :class="{ 'dynamic-color': !!discloseColor, 'is-open': showContent }"
  >
    <span class="fr-accordion__title">
      <button
        class="fr-accordion__btn"
        aria-expanded="false"
        :aria-controls="`accordion-${uniqueId}`"
      >
        {{ title }}
      </button>
    </span>
    <div
      :id="`accordion-${uniqueId}`"
      class="fr-collapse"
      v-on="{ 'dsfr.disclose': onDisclose, 'dsfr.conceal': onConceal }"
    >
      <slot v-if="showContent"></slot>
    </div>
  </div>
</template>

<style scoped>
.dynamic-color.is-open {
  background-color: v-bind(discloseColor);
}
</style>
