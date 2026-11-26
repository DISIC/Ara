<script setup lang="ts">
import CodingIcon from "../../assets/dsfr-custom-icons/coding.svg";
import { AuditReference, AuditType } from "../../types";
import { getCriteriaCount } from "../../utils";
import DsfrArtwork from "../ui/DsfrArtwork.vue";

defineProps<{
  value: AuditType;
  checked: boolean;
  modelValue: string | null;
  auditReference: AuditReference | null;
}>();

defineEmits(["update:modelValue"]);
</script>

<template>
  <div :class="['wrapper', { checked: checked }]">
    <!-- Allow click on the whole radio square -->
    <div class="radio-layer" @click="$emit('update:modelValue', value)" />

    <div class="radio-body">

      <div class="radio-header">
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
            :aria-describedby="`criteria-${value}`"
            @change="
              $emit('update:modelValue', ($event.target as HTMLInputElement).value)
            "
          />
          <label
            class="fr-label"
            :class="
              'fr-text--xl fr-text--bold fr-mb-0'
            "
            :for="`audit-type-${value}`"
          >
            {{ value === AuditType.FULL ? "Audit complet" : "Audit partiel" }}
          </label>
        </div>
        <div class="fr-pl-4w">
          <p :id="`criteria-${value}`" class="fr-text--sm fr-hint-text fr-mb-0">{{ getCriteriaCount(value, auditReference) }} critères</p>
        </div>
      </div>
      <div class="radio-img">
        <DsfrArtwork :file-path="CodingIcon" />
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

.wrapper.checked .radio-img {
  --border-default-grey: var(--background-default-grey-hover);
}

.radio-layer {
  position: absolute;
  inset: 0;
}

.radio-header {
  flex: 75%;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.radio-img {
  flex: 15%;
  padding-left: 0.5rem;
  border-left: 1px solid var(--border-default-grey);
}

.radio-body {
  display: flex;
  flex-direction: row;
  width: 100%;
  padding: 0.5rem;
}

.radio-input {
  /* When the browser scrolls to the required input from the bottom of the form, show the entire "radio block" */
  scroll-margin-top: 6rem;
}

/* Override DSFR radio input position to align with a larger label */
.fr-radio-group--sm input[type="radio"] + label {
  background-position:
    0 0.5rem,
    0 0.5rem !important;
  padding-left: 2rem;
}

.fr-radio-group--sm input[type="radio"] + label::before {
  top: 0.5rem;
  margin-left: -2rem;
}
</style>
