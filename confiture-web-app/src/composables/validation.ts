import { ComponentPublicInstance, ref } from "vue";

import { validateEmail } from "../utils";

export interface FocusableElement {
  focus(): void;
}

type ValidationRule = (fieldValue: string) => string | false;

export function useFormField(defaultValue: string, rules?: ValidationRule[]) {
  const fieldInputRef = ref<FocusableElement | null>();
  const fieldValue = ref<string>(defaultValue);
  const fieldError = ref<string>();

  function validate() {
    fieldError.value = undefined;

    if (!rules) return true;

    for (let i = 0; i < rules.length && !fieldError.value; i++) {
      fieldError.value = rules[i](fieldValue.value) || undefined;
    }

    if (fieldError.value) {
      fieldInputRef.value?.focus();
    }

    return !fieldError.value;
  }

  return {
    focusRef: fieldInputRef,
    refFn: (el: Element | ComponentPublicInstance | null) => {
      fieldInputRef.value = el as unknown as FocusableElement;
    },
    value: fieldValue,
    error: fieldError,
    validate
  };
}

export function validate(...fields: ReturnType<typeof useFormField>[]) {
  return !fields.map((it) => it.validate()).some((it) => !it);
}

/* Validation rules */

export function REQUIRED(msg: string): ValidationRule {
  return (value) => !value.trim() && msg;
}

export function LENGTH(minLength: number, msg: string): ValidationRule {
  return (value) => value.trim().length < minLength && msg;
}

export function EMAIL(msg: string): ValidationRule {
  return (value) => !validateEmail(value) && msg;
}
