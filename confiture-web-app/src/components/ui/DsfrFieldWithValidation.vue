<script setup lang="ts">
import { inject, onBeforeUnmount, watch } from "vue";
import { useFormField, ValidationRule } from "../../composables/validation";
import DsfrField, { type DsfrFielProps } from "./DsfrField.vue";
import { addFieldKey, removeFieldKey } from "./form-with-validation/form-injection-keys";

type DsfrFielWithValidationPrors = Omit<DsfrFielProps, "error" | "modelValue"> & {
  validation?: ValidationRule<string>[];
};

const { validation, ...props } = defineProps<DsfrFielWithValidationPrors>();
const model = defineModel<string>({ default: "" });

const fielValidation = useFormField(model.value, validation);

watch(model, newValue => {
  fielValidation.value.value = newValue;
});

defineExpose({
  validate(): boolean {
    return false;
  }
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
  <DsfrField
    v-bind="props"
    :ref="fielValidation.focusRef"
    v-model="model"
    :error="fielValidation.error.value"
  />
</template>
