<script setup lang="ts">
import { marked } from "marked";

import rgaa from "../../criteres.json";
import { CriteriumResultStatus } from "../../types";
import { formatStatus } from "../../utils";
import MarkdownRenderer from "../ui/MarkdownRenderer.vue";

defineProps<{
  topic: number;
  criterium: number;
  comment: string;
  status: CriteriumResultStatus;
}>();

function getCriterium(topicNumber: number, criteriumNumber: number) {
  // FIXME: "any everywhere" : The criteria properties of each topic do not have the same signature. See: https://github.com/microsoft/TypeScript/issues/33591#issuecomment-786443978
  const criterium = (rgaa.topics as any)
    .find((t: any) => t.number === topicNumber)
    ?.criteria.find((c: any) => c.criterium.number === criteriumNumber)
    .criterium;

  return criterium;
}

function getCriteriumTitle(topicNumber: number, criteriumNumber: number) {
  return marked.parseInline(getCriterium(topicNumber, criteriumNumber).title);
}
</script>

<template>
  <div>
    <p class="fr-text--lg fr-text--bold criterium-title fr-mb-3v">
      {{ topic }}.{{ criterium }}&nbsp;
      <span v-html="getCriteriumTitle(topic, criterium)" />
    </p>

    <p
      class="fr-badge fr-badge--sm fr-badge--no-icon fr-mb-3v"
      :class="
        status === CriteriumResultStatus.COMPLIANT
          ? 'fr-badge--success'
          : undefined
      "
    >
      {{ formatStatus(status) }}
    </p>

    <MarkdownRenderer v-if="comment" :markdown="comment" />
  </div>
</template>
