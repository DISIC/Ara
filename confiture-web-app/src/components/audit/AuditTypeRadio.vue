<script setup lang="ts">
import { ref } from "vue";

import { AuditType } from "../../types";
import { getCriteriaCount, pluralize } from "../../utils";

const props = defineProps<{
  value: AuditType;
  checked: boolean;
  modelValue: string | null;
  goals: { emoji: string; label: string }[];
}>();

const emit = defineEmits(["update:modelValue"]);

const inputRef = ref<HTMLInputElement>();

function handleLayerClick() {
  emit("update:modelValue", props.value);
  inputRef.value?.focus();
}
</script>

<template>
  <div :class="['fr-p-3w wrapper', { checked: checked }]">
    <!-- Allow click on the whole radio square -->
    <div class="radio-layer" @click="handleLayerClick" />

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
        @change="
          $emit('update:modelValue', ($event.target as HTMLInputElement).value)
        "
      />
      <label
        class="fr-label fr-text--xl fr-text--bold radio-label fr-mb-3v"
        :for="`audit-type-${value}`"
      >
        {{ getCriteriaCount(value) }} critères
      </label>
    </div>
    <div class="fr-pl-3w">
      <p class="fr-text--sm fr-mb-1w list-heading">
        {{ pluralize("Objectif", "Objectifs", goals.length) }}
      </p>
      <ul class="fr-m-0 fr-p-0">
        <li v-for="goal in goals" :key="goal.label" class="fr-mb-1w list-item">
          <span class="fr-text--lg fr-mb-0 list-item-icon" aria-hidden="true">
            {{ goal.emoji }}
          </span>
          {{ goal.label }}
        </li>
      </ul>
      <p class="fr-text--sm fr-mb-1w list-heading">Prérequis</p>
      <ul class="fr-m-0 fr-p-0">
        <li class="fr-mb-1w list-item">
          <span class="fr-text--lg fr-mb-0 list-item-icon" aria-hidden="true">
            🧑
          </span>
          Très bonnes connaissances techniques et du RGAA
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  flex-direction: column;
  border: 1px solid var(--border-default-grey);
  position: relative;
}

.wrapper.checked {
  --border-default-grey: var(--border-plain-blue-france);
}

.radio-layer {
  position: absolute;
  inset: 0;
  cursor: pointer;
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
  /* position: relative; */
}

.list-item-icon {
  background-color: var(--background-alt-grey);
  height: 2rem;
  width: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Override DSFR radio input position to align with a larger label */
fr-radio-group--sm input[type="radio"] + label {
  background-position:
    calc(-0.125rem + 1px) calc(0.5rem - 1px),
    calc(-0.125rem + 1px) calc(0.5rem - 1px);
}
</style>
