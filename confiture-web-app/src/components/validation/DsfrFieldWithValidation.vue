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
  },
  setError(errMsg: string | undefined, focus: boolean = false) {
    field.value?.setError(errMsg, focus);
  }
});

defineOptions({
  inheritAttrs: false
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
      v-bind="{ ...props, ...$attrs }"
      :ref="focusRef"
      v-model="model"
      :error="error"
    >
      <template v-if="$slots.hint" #hint><slot name="hint" /></template>
      <template v-if="$slots.trailing" #trailing><slot name="trailing" /></template>
    </DsfrField>
  </FieldValidation>
</template>
