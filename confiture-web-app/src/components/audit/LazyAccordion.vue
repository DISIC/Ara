<script lang="ts" setup>
import { ref, useId } from "vue";

defineProps<{
  /** Label of the accordion toggle button. */
  title?: string;
  /** When the accordion is disclosed, change the background color. */
  discloseColor?: string;
}>();

const accordionRef = ref<HTMLDivElement>();

defineExpose({ accordionRef });

const emit = defineEmits(["opened"]);

const showContent = ref(false);
const uniqueId = useId();

function onConceal(e: Event) {
  showContent.value = false;

  // When nesting <LazyAccordion />, prevent from closing the parent.
  e.stopPropagation();
}

function onDisclose() {
  showContent.value = true;
  requestAnimationFrame(function () {
    emit("opened");
  });
}
</script>

<template>
  <div ref="accordionRef" class="fr-accordions-group">
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
          <slot v-if="$slots.title" name="title"></slot>
          <template v-else>{{ title }}</template>
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
  </div>
</template>

<style scoped>
.dynamic-color.is-open {
  background-color: v-bind(discloseColor);
}
</style>
