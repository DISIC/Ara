<script setup lang="ts">
import { AuditType } from "../types";
import { getCriteriaCount } from "../utils";

defineProps<{
  label: string;
  value: AuditType;
  checked: boolean;
  modelValue: string | null;
  description: string;
  highlighted?: boolean;
}>();
defineEmits(["update:modelValue"]);
</script>

<template>
  <div :class="['fr-p-3w fr-tile container', { checked: checked }]">
    <p
      class="fr-badge fr-badge--sm fr-mb-1w"
      :class="{ 'fr-badge--green-bourgeon': highlighted }"
    >
      {{ getCriteriaCount(value) }} critères
    </p>
    <div class="fr-radio-group">
      <input
        :id="`audit-type-${value}`"
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
      <!-- TODO: make the whole square clickable -->
      <label
        class="fr-label fr-text--xl fr-text--bold label"
        :for="`audit-type-${value}`"
      >
        {{ label }}
        <span
          class="fr-text fr-text--md fr-text--regular fr-mb-0 fr-mt-3v"
          v-html="description"
        />
      </label>
    </div>
  </div>
</template>

<style scoped>
.container {
  flex-direction: column;
}

.container.checked {
  --border-default-grey: var(--border-plain-blue-france);
}

.radio-input {
  /* When the browser scrolls to the required input from the bottom of the form, show the entire "radio block" */
  scroll-margin-top: 6rem;
}

.label::before {
  /* Align radio to label. This label size for radio does not exist in DSFR. */
  margin-top: 1rem !important;
  margin-right: 0.75rem !important;
}
</style>
