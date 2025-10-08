<script setup lang="ts">
import { useTemplateRef } from "vue";
import { ValidationRule } from "../../composables/validation";
import DsfrField, { type DsfrFieldProps } from "../ui/DsfrField.vue";
import FieldValidation from "./FieldValidation.vue";

type DsfrFieldWithValidationProps = Omit<DsfrFieldProps, "error" | "modelValue"> & {
  validation: ValidationRule<string>[];
};

const { validation, ...props } = defineProps<DsfrFieldWithValidationProps>();
const model = defineModel<string>({ default: "" });

const field = useTemplateRef("field");

defineExpose({
  focus() {
    field.value?.focus();
  }
});
</script>

<template>
  <FieldValidation
    ref="field"
    v-slot="{ error, focusRef }"
    :validation="validation"
    :value="model"
  >
    <DsfrField
      v-bind="props"
      :ref="focusRef"
      v-model="model"
      :error="error"
    />
  </FieldValidation>
</template>
