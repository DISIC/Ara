<script setup lang="ts">
import { useTemplateRef } from "vue";
import { ValidationRule } from "../../composables/validation";
import DsfrPassword, { type DsfrPasswordProps } from "../ui/DsfrPassword.vue";
import FieldValidation from "./FieldValidation.vue";

type DsfrPasswordWithValidationProps = Omit<DsfrPasswordProps, "error" | "modelValue"> & {
  validation: ValidationRule<string>[];
};

const { validation, ...props } = defineProps<DsfrPasswordWithValidationProps>();
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
    <DsfrPassword
      v-bind="{ ...props, ...$attrs }"
      :ref="focusRef"
      v-model="model"
      :error="error"
    />
  </FieldValidation>
</template>
