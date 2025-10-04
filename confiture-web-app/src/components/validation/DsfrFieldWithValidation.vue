<script setup lang="ts">
import { ValidationRule } from "../../composables/validation";
import DsfrField, { type DsfrFielProps } from "../ui/DsfrField.vue";
import FieldValidation from "./FieldValidation.vue";

type DsfrFielWithValidationPrors = Omit<DsfrFielProps, "error" | "modelValue"> & {
  validation: ValidationRule<string>[];
};

const { validation, ...props } = defineProps<DsfrFielWithValidationPrors>();
const model = defineModel<string>({ default: "" });
</script>

<template>
  <FieldValidation
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
