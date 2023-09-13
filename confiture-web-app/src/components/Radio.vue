<script lang="ts">
export type RadioColor = "red" | "green" | "yellow" | "grey";
</script>

<script setup lang="ts">
defineProps<{
  label: string;
  id: string;
  name: string;
  color?: RadioColor;
  value: string | null;
  modelValue: string | null;
}>();
defineEmits(["update:modelValue"]);
</script>

<template>
  <div>
    <input
      :id="id"
      class="sr-only"
      type="radio"
      :name="name"
      :checked="value === modelValue"
      :value="value"
      @input="
        $emit('update:modelValue', ($event.target as HTMLInputElement).value)
      "
    />
    <label :class="['fr-text--sm fr-mb-0 label', color]" :for="id">
      {{ label }}
    </label>
  </div>
</template>

<style scoped>
.label {
  --background-color: transparent;
  --text-color: var(--text-default-grey);

  background-color: var(--background-color);
  color: var(--text-color);
  position: relative;
  border-radius: 1.875rem;
  border: 1px solid currentColor;
  display: inline-flex;
  padding: 0.25rem 0.5rem 0.25rem 2rem;
  gap: 0.5rem;
  text-transform: capitalize;
  transition: background-color 0.2s ease, color 0.2s ease;
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
