<script lang="ts" setup>
import { computed, ref } from "vue";

const props = defineProps<{
  modelValue?: string;
  label: string;
  hint?: string;
  type?: "text" | "email" | "url";
  required?: boolean;
  pattern?: RegExp;
  title?: string;
  error?: string;
  id: string;
  autocomplete?: string;
}>();

defineEmits<{
  (e: "update:modelValue", payload: string): void;
}>();

const isError = computed(() => !!props.error);

const inputId = props.id + "-input";
const errorId = props.id + "-error-message";

const inputRef = ref<HTMLInputElement>();
defineExpose({
  inputRef,
  focus() {
    inputRef.value?.focus();
  }
});
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
      :pattern="pattern ? pattern.toString().slice(1, -1) : undefined"
      :title="title"
      :autocomplete="autocomplete"
      :value="modelValue"
      @input="
        $emit('update:modelValue', ($event.target as HTMLInputElement).value)
      "
    />
    <slot name="trailing" />

    <p v-if="isError" :id="errorId" class="fr-error-text">
      {{ error }}
    </p>
  </div>
</template>
