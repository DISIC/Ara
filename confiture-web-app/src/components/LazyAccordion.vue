<script lang="ts">
let nextId = 1;
</script>

<script lang="ts" setup>
import { ref } from "vue";

defineProps<{ title: string }>();

const showContent = ref(false);
const uniqueId = nextId++;

function onConceal() {
  showContent.value = false;
}

function onDisclose() {
  showContent.value = true;
}
</script>

<template>
  <div class="fr-accordion">
    <span class="fr-accordion__title">
      <button
        class="fr-accordion__btn"
        aria-expanded="false"
        :aria-controls="`tests-refs-${uniqueId}`"
      >
        {{ title }}
      </button>
    </span>
    <div
      :id="`tests-refs-${uniqueId}`"
      class="fr-collapse"
      v-on="{ 'dsfr.disclose': onDisclose, 'dsfr.conceal': onConceal }"
    >
      <slot v-if="showContent"></slot>
    </div>
  </div>
</template>
