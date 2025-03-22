<script setup lang="ts">
import { marked } from "marked";

import methodologies from "../../methodologies.json";
import { pluralize } from "../../utils";
import CriteriumAppendix from "./CriteriumAppendix.vue";
import LazyAccordion from "./LazyAccordion.vue";

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
        <strong>{{ topicNumber }}.{{ criterium.number }}.{{ i + 1 }}</strong>
        <div v-html="test" />
      </div>

      <LazyAccordion
        :title="`Méthodologie du test ${topicNumber}.${criterium.number}.${
          i + 1
        }`"
        :class="{ 'fr-mb-4w': i !== testsHtml.length - 1 }"
      >
        <div class="criterium-test-methodology" v-html="methodologiesHtml[i]" />
      </LazyAccordion>
    </template>

    <!-- Particular cases -->
    <CriteriumAppendix
      v-if="criterium.particularCases?.length"
      :title="
        pluralize(
          'Cas particulier',
          'Cas particuliers',
          criterium.particularCases.length
        )
      "
      :appendices="criterium.particularCases"
    />

    <!-- Technical notes -->
    <CriteriumAppendix
      v-if="criterium.technicalNote?.length"
      :title="
        pluralize(
          'Note technique',
          'Notes techniques',
          criterium.technicalNote.length
        )
      "
      :appendices="criterium.technicalNote"
    />
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
