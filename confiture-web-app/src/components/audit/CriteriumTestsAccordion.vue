<script setup lang="ts">
import { marked } from "marked";

import methodologies from "../../methodologies.json";
import { pluralize } from "../../utils";
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

    <!-- Particular cases -->
    <div v-if="criterium.particularCases?.length" class="fr-mt-4w">
      <h5 class="fr-text--lg fr-mb-2w">
        {{
          pluralize(
            "Cas particulier",
            "Cas particuliers",
            criterium.particularCases.length
          )
        }}
      </h5>
      <div class="fr-m-0 fr-p-0">
        <template
          v-for="(particularCase, j) in criterium.particularCases"
          :key="j"
        >
          <ul
            v-if="particularCase.ul"
            :class="
              j === criterium.particularCases.length - 1
                ? 'fr-mb-0'
                : 'fr-mb-2w'
            "
          >
            <!-- substring() removes "- " which creates unwanted <ul> -->
            <li
              v-for="(li, k) in particularCase.ul"
              :key="k"
              v-html="marked.parseInline(li.substring(2))"
            />
          </ul>
          <p
            v-else
            :class="
              j === criterium.particularCases.length - 1 ||
              criterium.particularCases[j + 1]?.ul?.length
                ? 'fr-mb-0'
                : 'fr-mb-2w'
            "
            v-html="marked.parseInline(particularCase)"
          />
        </template>
      </div>
    </div>

    <!-- Technical notes -->
    <div v-if="criterium.technicalNote?.length" class="fr-mt-4w">
      <h5 class="fr-text--lg fr-mb-2w">
        {{
          pluralize(
            "Note technique",
            "Notes techniques",
            criterium.technicalNote.length
          )
        }}
      </h5>
      <div class="fr-m-0 fr-p-0">
        <template v-for="(note, j) in criterium.technicalNote" :key="j">
          <ul
            v-if="note.ul"
            :class="
              j === criterium.technicalNote.length - 1 ? 'fr-mb-0' : 'fr-mb-2w'
            "
          >
            <!-- substring() removes "- " which creates unwanted <ul> -->
            <li
              v-for="(li, k) in note.ul"
              :key="k"
              v-html="marked.parseInline(li.substring(2))"
            />
          </ul>
          <p
            v-else
            :class="
              j === criterium.technicalNote.length - 1 ||
              criterium.technicalNote[j + 1]?.ul?.length
                ? 'fr-mb-0'
                : 'fr-mb-2w'
            "
            v-html="marked.parseInline(note)"
          />
        </template>
      </div>
    </div>
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
