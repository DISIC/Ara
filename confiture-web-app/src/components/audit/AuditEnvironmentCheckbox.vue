<script lang="ts" setup>
import { slugify } from "../../utils";
import { AssistiveTechnology, Browsers, Platform } from "../../enums";

const props = defineProps<{
  value: string;
  modelValue: string[];
  platform: Platform;
  title: string;
  combinations: {
    browser: Browsers;
    assistiveTechnology: AssistiveTechnology;
  }[];
}>();

const emit = defineEmits(["update:modelValue"]);

function onInput() {
  if (props.modelValue.includes(props.value)) {
    emit(
      "update:modelValue",
      props.modelValue.filter((el) => el !== props.value)
    );
  } else {
    emit("update:modelValue", [...props.modelValue, props.value]);
  }
}
</script>

<template>
  <div class="fr-p-3w container">
    <!-- Allow click on the whole radio square -->
    <div class="container-layer" @click="onInput" />
    <p
      v-if="platform === Platform.DESKTOP"
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
        :checked="modelValue.includes(value)"
        type="checkbox"
        :aria-describedby="slugify(`combinations-table-${title}-${platform}`)"
        @input="onInput"
      />
      <label
        class="fr-label fr-text--xl fr-text--bold fr-mb-0 label"
        :for="slugify(`suggested-env-${title}-${platform}`)"
        >{{ title }}</label
      >
    </div>

    <div
      class="fr-table fr-table--bordered fr-table--layout-fixed fr-table--no-caption fr-mb-0 combination-table"
    >
      <table :id="slugify(`combinations-table-${title}-${platform}`)">
        <caption>
          Couples navigateur et technologie d’assistance sur
          {{
            platform === Platform.DESKTOP ? "ordinateur" : "mobile"
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
  position: relative;
}

.container-layer {
  background: red;
  opacity: 0.2;
  position: absolute;
  inset: 0;
  cursor: pointer;
}

/* Override position to allow click on whole card */
.combination-table {
  position: initial;
}

.label::before {
  /* Align radio to label. This label size for radio does not exist in DSFR. */
  margin-top: 0.25rem !important;
}
</style>
