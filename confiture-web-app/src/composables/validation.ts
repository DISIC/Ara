import { ComponentPublicInstance, ref } from "vue";

import { URL_REGEX, validateEmail } from "../utils";

export interface FocusableElement {
  focus(): void;
}

type ValidationRule<T> = (fieldValue: T) => string | false;

export function useFormField<T>(defaultValue: T, rules?: ValidationRule<T>[]) {
  const fieldInputRef = ref<FocusableElement | null>();
  const fieldValue = ref<T>(defaultValue);
  const fieldError = ref<string>();

  function validate() {
    fieldError.value = undefined;

    if (!rules) return true;

    for (let i = 0; i < rules.length && !fieldError.value; i++) {
      fieldError.value = rules[i](fieldValue.value as T) || undefined;
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
  return !fields
    .reverse()
    .map((it) => it.validate())
    .some((it) => !it);
}

/* Validation rules */

export function REQUIRED(msg: string): ValidationRule<string | null> {
  return (value) => !value?.trim() && msg;
}

export function LENGTH(minLength: number, msg: string): ValidationRule<string> {
  return (value) => value?.trim().length < minLength && msg;
}

export function EMAIL(msg: string): ValidationRule<string> {
  return (value) => !!value && !validateEmail(value) && msg;
}

export function URL(msg: string): ValidationRule<string> {
  return (value) => !!value && !URL_REGEX.test(value) && msg;
}
