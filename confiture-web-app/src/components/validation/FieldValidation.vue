<script setup lang="ts" generic="T">
import { inject, onBeforeUnmount, watch } from "vue";
import { useFormField, ValidationRule } from "../../composables/validation";
import { addFieldKey, removeFieldKey } from "./form-with-validation/form-injection-keys";

type DsfrFielWithValidationPrors = {
  value: T;
  validation: ValidationRule<T>[];
};

const props = defineProps<DsfrFielWithValidationPrors>();

const fieldValidation = useFormField<T>(props.value, props.validation);

watch(() => props.value, newValue => {
  fieldValidation.value.value = newValue;
});

const addFieldToForm = inject(addFieldKey);
const removeFieldFromForm = inject(removeFieldKey);

if (!addFieldToForm) {
  console.warn("Cannot add validated field to form. Make sure <FormWithValidation> is a parent component.");
} else {
  addFieldToForm(fieldValidation);
}

onBeforeUnmount(() => {
  if (!removeFieldFromForm) {
    console.warn("Cannot remove validated field to form. Make sure <FormWithValidation> is a parent component.");
  } else {
    removeFieldFromForm(fieldValidation);
  }
});

defineExpose({
  focus() {
    fieldValidation.focusRef.value?.focus();
  }
});
</script>

<template>
  <slot
    :focus-ref="fieldValidation.focusRef"
    :error="fieldValidation.error.value"
  />
</template>
