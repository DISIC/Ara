<script setup lang="ts">
import { marked } from "marked";

import methodologies from "../../methodologies.json";
import LazyAccordion from "../LazyAccordion.vue";

const props = defineProps<{
  topicNumber: number;
  // FIXME: type things
  criterium: any;
}>();

const testsHtml = Object.values(
  props.criterium.tests as Record<string, string | string[]>
).map((test) =>
  marked.parse(
    Array.isArray(test)
      ? test.map((line, i) => (i === 0 ? line : `- ${line}`)).join("\n")
      : test
  )
);

const methodologiesHtml = Object.values(
  props.criterium.tests as Record<string, string | string[]>
).map((_, i) => {
  const key = `${props.topicNumber}.${props.criterium.number}.${
    i + 1
  }` as string;
  return marked.parse((methodologies as Record<string, string>)[key]);
});
</script>

<template>
  <LazyAccordion
    :title="`Tests et références du critère ${topicNumber}.${criterium.number}`"
    disclose-color="var(--background-default-grey)"
  >
    <template v-for="(test, i) in testsHtml" :key="i">
      <div class="criterium-test">
        <div>{{ topicNumber }}.{{ criterium.number }}.{{ i + 1 }}</div>
        <div v-html="test" />
      </div>

      <div
        class="fr-accordion"
        :class="{ 'fr-mb-4w': i !== testsHtml.length - 1 }"
      >
        <span class="fr-accordion__title">
          <button
            class="fr-accordion__btn"
            aria-expanded="false"
            :aria-controls="`criterium-tests-accordion-${topicNumber}-${
              criterium.number
            }-${i + 1}`"
          >
            Méthodologie du test {{ topicNumber }}.{{ criterium.number }}.{{
              i + 1
            }}
          </button>
        </span>
        <div
          :id="`criterium-tests-accordion-${topicNumber}-${criterium.number}-${
            i + 1
          }`"
          class="fr-collapse criterium-test-methodology"
        >
          <div v-html="methodologiesHtml[i]" />
        </div>
      </div>
    </template>
  </LazyAccordion>
</template>

<style scoped>
.criterium-test {
  display: grid;
  grid-template-columns: 3rem 1fr;
}

/* Fixes ol numbering used by dsfr to only show the test number. */
.criterium-test-methodology :deep(ol) {
  counter-reset: none;
  counter-set: li-counter 0;
}
</style>
