<script setup lang="ts" generic="T">
import { inject, onBeforeUnmount, watch } from "vue";
import { useFormField, ValidationRule } from "../../composables/validation";
import { addFieldKey, removeFieldKey } from "./form-with-validation/form-injection-keys";

type DsfrFielWithValidationPrors = {
  value: T;
  validation: ValidationRule<T>[];
};

const props = defineProps<DsfrFielWithValidationPrors>();

const fielValidation = useFormField<T>(props.value, props.validation);

watch(() => props.value, newValue => {
  fielValidation.value.value = newValue;
});

const addFieldToForm = inject(addFieldKey);
const removeFieldFromForm = inject(removeFieldKey);

if (!addFieldToForm) {
  console.warn("Cannot add validated field to form. Make sure <FormWithValidation> is a parent component.");
} else {
  addFieldToForm(fielValidation);
}

onBeforeUnmount(() => {
  if (!removeFieldFromForm) {
    console.warn("Cannot add validated field to form. Make sure <FormWithValidation> is a parent component.");
  } else {
    removeFieldFromForm(fielValidation);
  }
});
</script>

<template>
  <slot
    :focus-ref="fielValidation.focusRef"
    :error="fielValidation.error.value"
  />
</template>
