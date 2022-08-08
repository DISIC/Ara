<script lang="ts">
export enum RadioStatus {
  SUCCESS = "SUCCESS",
  NEUTRAL = "NEUTRAL",
  WARNING = "WARNING",
  DANGER = "DANGER",
  DEFAULT = "DEFAULT",
}
</script>

<script setup lang="ts">
defineProps<{
  label: string;
  id: string;
  name: string;
  status: RadioStatus;
  modelValue: string;
}>();
defineEmits(["update:modelValue"]);
</script>

<template>
  <div>
    <!-- TODO: plug fucking model -->
    <input
      :id="id"
      class="sr-only"
      type="radio"
      :name="name"
      :value="modelValue"
      @input="
        $emit('update:modelValue', ($event.target as HTMLInputElement).value)
      "
    />
    <label :class="['fr-text--sm label', status.toLowerCase()]" :for="id">
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
  transition: background-color 0.2s ease, color 0.2s ease;
}

input:checked + .label.default {
  --background-color: transparent;
  --text-color: var(--text-default-grey);
}

input:checked + .label.neutral {
  --background-color: var(--background-disabled-grey);
}

input:checked + .label.success {
  --background-color: var(--background-contrast-success);
  --text-color: var(--text-default-success);
}

input:checked + .label.warning {
  --background-color: var(--background-alt-yellow-moutarde);
  --text-color: var(--text-label-yellow-moutarde);
}

input:checked + .label.danger {
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
