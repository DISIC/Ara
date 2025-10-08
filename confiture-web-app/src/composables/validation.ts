import { ComponentPublicInstance, ref } from "vue";
import { URL_REGEX, validateEmail } from "../utils";

export interface FocusableElement {
  focus(): void;
}

export type ValidationRule<T> = (fieldValue: T) => string | false;

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

export type ValidatedField = ReturnType<typeof useFormField>;

/**
 * For each form field object given as parameters, validate the field value
 * and set the error property if any.
 *
 * Also move the focus to the first invalid field in the document if any.
 *
 * @param fields Objects returned by `useFormField`.
 * @returns True if every fields are valid, false otherwise.
 */
export function validate(...fields: ReturnType<typeof useFormField>[]) {
  // field.validate() focuses the element if it is invalid,
  // we collect the focused elements
  const focusableInvalidElements: HTMLElement[] = [];
  fields.forEach(field => {
    if (!field.validate()) {
      focusableInvalidElements.push(document.activeElement as HTMLElement);
    }
  });

  // if there are errors, sort the elements by their position in the document
  // and focus the first one
  if (focusableInvalidElements.length) {
    // FIXME: no need to sort the array, we just need to find the one element
    focusableInvalidElements.sort((a, b) => {
      const position = a.compareDocumentPosition(b);
      if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
      if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
      return 0;
    });
    focusableInvalidElements.at(0)?.focus();
  }

  return !focusableInvalidElements.length;
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

export function EQUAL(target: string, msg: string): ValidationRule<string> {
  return value => !!value && value !== target && msg;
}

export function ARRAY_LENGTH(minLength: number, msg: string): ValidationRule<any[]> {
  return value => !!value && value.length < minLength && msg;
}
