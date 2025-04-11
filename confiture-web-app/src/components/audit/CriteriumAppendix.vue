<script setup lang="ts">
import { marked } from "marked";

defineProps<{
  title: string;
  appendices: any;
}>();
</script>

<template>
  <div class="fr-mt-4w">
    <h5 class="fr-text--lg fr-mb-2w">
      {{ title }}
    </h5>
    <div class="fr-m-0 fr-p-0">
      <template v-for="(particularCase, j) in appendices" :key="j">
        <ul
          v-if="particularCase.ul"
          :class="j === appendices.length - 1 ? 'fr-mb-0' : 'fr-mb-2w'"
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
            j === appendices.length - 1 || appendices[j + 1]?.ul?.length
              ? 'fr-mb-0'
              : 'fr-mb-2w'
          "
          v-html="marked.parseInline(particularCase)"
        />
      </template>
    </div>
  </div>
</template>
