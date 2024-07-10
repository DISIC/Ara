<script lang="ts">
export type RadioColor = "red" | "green" | "yellow" | "grey";
</script>

<script lang="ts" setup>
import { useUniqueId } from "../../composables/useUniqueId";

const props = defineProps<{
  label: string;
  hideLabel?: boolean;
  items: {
    value: any;
    label: string;
    color?: RadioColor;
  }[];
  disabled?: boolean;
  defaultValue: any;

  modelValue: any;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", payload: any): void;
}>();

const uniqueId = useUniqueId();

function handleChange(value: string) {
  if (value === props.modelValue) {
    emit("update:modelValue", props.defaultValue);
  } else {
    emit("update:modelValue", value);
  }
}
</script>

<template>
  <fieldset class="fr-mx-0 fr-p-0 fieldset">
    <legend :class="hideLabel ? 'sr-only' : 'fr-label fr-mb-3v'">
      {{ label }}
    </legend>
    <div v-for="(item, i) in items" :key="i">
      <input
        :id="`checkbox-group-${uniqueId}--${i}`"
        class="sr-only"
        type="checkbox"
        :disabled="disabled"
        :checked="modelValue === item.value"
        @input="handleChange(item.value)"
      />
      <label
        class="fr-text--sm fr-mb-0 fr-py-1v fr-pr-1w fr-pl-4w label"
        :class="item.color"
        :for="`checkbox-group-${uniqueId}--${i}`"
      >
        {{ item.label }}
      </label>
    </div>
  </fieldset>
</template>

<style scoped>
.fieldset {
  border: none;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.label {
  --background-color: transparent;
  --text-color: var(--text-default-grey);

  background-color: var(--background-color);
  color: var(--text-color);
  position: relative;
  border-radius: 1.875rem;
  border: 1px solid currentColor;
  display: inline-flex;
  gap: 0.5rem;
  text-transform: capitalize;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

input:checked + .label {
  --background-color: transparent;
  --text-color: var(--text-default-grey);
}

input:checked + .label.grey {
  --background-color: var(--background-disabled-grey);
}

input:checked + .label.green {
  --background-color: var(--background-contrast-success);
  --text-color: var(--text-default-success);
}

input:checked + .label.yellow {
  --background-color: var(--background-alt-yellow-moutarde);
  --text-color: var(--text-label-yellow-moutarde);
}

input:checked + .label.red {
  --background-color: var(--background-contrast-error);
  --text-color: var(--text-default-error);
}

.label::before,
.label::after {
  content: "";
  border-radius: 50%;
  top: 50%;
  transform: translateY(-50%);
  position: absolute;
}

.label::before {
  width: 1rem;
  height: 1rem;
  border: 1px solid currentColor;
  left: 0.5rem;
}

.label::after {
  background-color: transparent;
  width: 0.5rem;
  height: 0.5rem;
  left: 0.75rem;
  transition: background-color 0.2s ease;
}

input:checked + .label::after {
  background-color: currentColor;
}
</style>
