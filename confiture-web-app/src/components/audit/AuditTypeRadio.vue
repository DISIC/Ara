<script setup lang="ts">
import { computed, ref } from "vue";

import CodingIcon from "../../assets/dsfr-custom-icons/coding.svg";
import { AuditType } from "../../types";

import { getCriteriaCount } from "../../utils";
import DsfrArtwork from "../ui/DsfrArtwork.vue";

const props = defineProps<{
  value: AuditType;
  checked: boolean;
  modelValue: string | null;
  goals: string[];
  documentationLink: string;
  isError?: boolean;
  label: string;
  tag?: string;
}>();

defineEmits(["update:modelValue"]);

const inputRef = ref<HTMLInputElement>();

defineExpose({
  inputRef,
  focus() {
    inputRef.value?.focus();
  }
});

// String used to describe input with goals, requirement and error if any
const descriptionId = computed(() => {
  return `${props.goals.map((_g, i) => `goal-${i}-${props.value}`).join(" ")}`
      + `${props.isError ? " audit-type-error" : ""}`
  ;
}
);
</script>

<template>
  <div :class="['wrapper', { 'checked': checked, 'is-error': isError }]">
    <!-- Allow click on the whole radio square -->
    <div class="radio-layer" @click="$emit('update:modelValue', value)" />

    <div class="radio-header">
      <span
        v-if="tag"
        :class="[
          'fr-badge fr-badge--sm fr-badge--no-icon',
          {
            'fr-badge--purple-glycine': tag === 'Valeur légale',
            'fr-badge--info ': tag === 'Bêta'
          }
        ]"
      >{{ tag }}</span>

      <DsfrArtwork :file-path="CodingIcon" />

    </div>

    <div class="radio-body fr-p-3w">
      <div class="fr-radio-group fr-radio-group--sm">
        <input
          :id="`audit-type-${value}`"
          ref="inputRef"
          class="radio-input"
          type="radio"
          name="audit-type"
          :value="value"
          :checked="value === modelValue"
          required
          :aria-describedby="descriptionId"
          @change="
            $emit('update:modelValue', ($event.target as HTMLInputElement).value)
          "
        />
        <label
          class="fr-label radio-label"
          :class="
            'fr-text--xl fr-text--bold fr-mb-0'
          "
          :for="`audit-type-${value}`"
        >
          {{ value === AuditType.FULL ? "Audit complet" : "Audit partiel" }}
        </label>
      </div>
      <div class="fr-pl-3w">
        <p class="fr-mb-1w fr-text--bold">{{ label }}</p>
        <p class="fr-text--sm fr-hint-text">{{ getCriteriaCount(value) }} critères</p>

        <ul class="fr-m-0 fr-mb-2w fr-p-0">
          <li
            v-for="(goal, i) in goals"
            :id="`goal-${i}-${value}`"
            :key="goal"
            class="list-item"
            :class="{ 'fr-mb-1w': i !== goals.length - 1 }"
          >
            <span
              class="fr-icon-check-line fr-icon--sm list-item-icon"
              aria-hidden="true"
            />
            {{ goal }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  flex-direction: column;
  border: 1px solid var(--border-default-grey);
  position: relative;
  cursor: pointer;
}

.wrapper:hover {
  background-color: var(--background-default-grey-hover);
}

.wrapper.checked {
  --border-default-grey: var(--border-plain-blue-france);
}

.radio-layer {
  position: absolute;
  inset: 0;
}

.radio-header {
  height: 9rem;
  background: var(--background-alt-blue-france);
  display: flex;
}

.radio-header .fr-badge {
  position: absolute;
  margin-top: 0.5rem;
  margin-left: 0.5rem;
}

.radio-header svg {
  width: 6rem;
  height: 6rem;
  margin: auto;
}

.is-error .radio-label {
  color: var(--text-default-error);
}

.radio-input {
  /* When the browser scrolls to the required input from the bottom of the form, show the entire "radio block" */
  scroll-margin-top: 6rem;
}

.list-heading {
  color: var(--text-mention-grey);
}

.list-item {
  display: flex;
  align-items: first baseline;
  gap: 0.5rem;
}

.list-item-icon {
  background-color: var(--background-contrast-info);
  color: var(--text-default-info);
  height: 1.5rem;
  width: 1.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.radio-link {
  position: relative;
}

/* Override DSFR radio input position to align with a larger label */
.fr-radio-group--sm input[type="radio"] + label {
  background-position:
    0 0.5rem,
    0 0.5rem !important;
}

.fr-radio-group--sm input[type="radio"] + label::before {
  top: 0.5rem;
}
</style>
