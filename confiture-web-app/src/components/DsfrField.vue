<script lang="ts" setup>
import { computed, ref } from "vue";

const props = defineProps<{
  // FIXME: is this okay?
  modelValue: string | undefined;
  label: string;
  hint?: string;
  type?: "text" | "email" | "url";
  required?: boolean;
  error?: string;
  id: string;
}>();

defineEmits<{
  (e: "update:modelValue", payload: string): void;
}>();

const isError = computed(() => !!props.error);

const inputId = props.id + "-input";
const errorId = props.id + "-error-message";

const inputRef = ref<HTMLInputElement>();
defineExpose({ inputRef });
</script>

<template>
  <div :class="['fr-input-group', { 'fr-input-group--error': isError }]">
    <label class="fr-label" :for="inputId">
      {{ label }}
      <span v-if="hint || $slots.hint" class="fr-hint-text">
        <slot name="hint">{{ hint }}</slot>
      </span>
    </label>
    <input
      :id="inputId"
      ref="inputRef"
      :class="['fr-input', { 'fr-input--error': isError }]"
      :type="type"
      :aria-describedby="isError ? errorId : undefined"
      :required="required"
      :value="modelValue"
      @input="
        $emit('update:modelValue', ($event.target as HTMLInputElement).value)
      "
    />
    <p v-if="isError" :id="errorId" class="fr-error-text">
      {{ error }}
    </p>
  </div>
</template>
