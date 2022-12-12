<script lang="ts" setup>
import { slugify } from "../utils";
import { PLATFORM } from "../enums";

defineProps<{
  // FIXME: use something like "keyof typeof PLATFORM" for platform, browser and AT
  platform: string;
  title: string;
  combinations: { browser: string; assistiveTechnology: string }[];
}>();
</script>

<template>
  <div class="fr-p-3w container">
    <p
      v-if="platform === PLATFORM.DESKTOP"
      class="fr-badge fr-badge--sm fr-badge--purple-glycine fr-mb-1w"
    >
      Ordinateur
    </p>
    <p v-else class="fr-badge fr-badge--sm fr-badge--brown-caramel fr-mb-1w">
      Mobile
    </p>

    <div class="fr-checkbox-group fr-mb-1w">
      <input
        :id="slugify(`suggested-env-${title}-${platform}`)"
        type="checkbox"
        name="checkbox"
      />
      <label
        class="fr-label fr-text--xl fr-text--bold fr-mb-0 label"
        :for="slugify(`suggested-env-${title}-${platform}`)"
        >{{ title }}</label
      >
    </div>

    <div class="fr-table fr-table--bordered fr-table--no-caption fr-mb-0">
      <table>
        <caption>
          Couples navigateur et technologie d’assistance sur
          {{
            platform === PLATFORM.DESKTOP ? "ordinateur" : "mobile"
          }}
        </caption>
        <thead>
          <tr>
            <th scope="col">Navigateur</th>
            <th scope="col">Technologie d’assistance</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(couple, i) in combinations" :key="i">
            <td>{{ couple.browser }}</td>
            <td>{{ couple.assistiveTechnology }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.container {
  border: 1px solid var(--border-default-grey);
}
.label::before {
  /* Align radio to label. This label size for radio does not exist in DSFR. */
  margin-top: 1rem !important;
  margin-right: 0.75rem !important;
}
</style>
