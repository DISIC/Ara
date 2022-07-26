<script setup lang="ts">
import { defineProps } from "vue";

defineProps<{
  label: string;
  badge: string;
  value: string | undefined;
  checked: boolean;
  modelValue: string | undefined;
}>();
defineEmits(["update:modelValue"]);
</script>

<template>
  <div :class="['fr-p-3w container', { checked: checked }]">
    <p class="fr-badge fr-badge--sm fr-badge--purple-glycine fr-mb-2w">
      {{ badge }}
    </p>
    <div class="fr-radio-group group">
      <input
        :id="`audit-type-${value}`"
        type="radio"
        name="audit-type"
        :value="value"
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
      </label>
    </div>
  </div>
</template>

<style scoped>
.container {
  border: 1px solid var(--border-default-grey);
}

.container.checked {
  border-color: var(--border-plain-blue-france);
}

.label::before {
  /* Align radio to label. This label size for radio does not exist in DSFR. */
  margin-top: 1rem !important;
  margin-right: 0.75rem !important;
}
</style>
