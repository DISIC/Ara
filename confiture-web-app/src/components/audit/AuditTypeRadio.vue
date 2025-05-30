<script setup lang="ts">
import { computed, ref } from "vue";

import { AuditType } from "../../types";
import { getCriteriaCount } from "../../utils";

const props = defineProps<{
  value: AuditType;
  checked: boolean;
  modelValue: string | null;
  goals: string[];
  documentationLink: string;
  detailed?: boolean;
}>();

defineEmits(["update:modelValue"]);

const inputRef = ref<HTMLInputElement>();

// String used to describe input with goals and requirements
const descriptionId = computed(() => {
  return (
    `goal-${props.value}` +
    `${props.goals.map((g, i) => ` goal-${i}-${props.value}`).join(" ")}` +
    ` requirements-${props.value} requirement-${props.value}`
  );
});
</script>

<template>
  <div :class="['fr-p-3w wrapper', { checked: checked }]">
    <!-- Allow click on the whole radio square -->
    <div class="radio-layer" @click="$emit('update:modelValue', value)" />

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
        :class="`fr-label ${
          detailed ? 'fr-h4 fr-mb-3w' : 'fr-text--xl fr-text--bold fr-mb-0'
        } radio-label`"
        :for="`audit-type-${value}`"
      >
        {{ getCriteriaCount(value) }} critères
      </label>
    </div>
    <div v-if="detailed" class="fr-pl-3w">
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
      <p class="fr-text--sm prerequisite fr-mb-3v">
        Nécessite de très bonnes connaissances techniques et du RGAA
      </p>
    </div>
    <p v-else class="fr-text--xs fr-pl-3w fr-m-0">
      {{ value === AuditType.FULL ? "Audit complet" : "Audit partiel" }}
    </p>
  </div>
</template>

<style scoped>
.wrapper {
  flex-direction: column;
  border: 1px solid var(--border-default-grey);
  position: relative;
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

.prerequisite {
  font-weight: 500;
}

/* Override DSFR radio input position to align with a larger label */
.fr-radio-group--sm input[type="radio"] + label {
  background-position:
    calc(-0.125rem + 1px) calc(0.5rem - 1px),
    calc(-0.125rem + 1px) calc(0.5rem - 1px) !important;
}

.fr-radio-group--sm input[type="radio"] + label::before {
  top: 0.5rem;
}
</style>
