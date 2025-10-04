<script setup lang="ts">
import { provide } from "vue";
import { validate, ValidatedField } from "../../../composables/validation";
import { addFieldKey, removeFieldKey } from "./form-injection-keys";

const fields: ValidatedField[] = [];

const emit = defineEmits<{
  submit: [];
}>();

function handleSubmit() {
  if (!validate(...fields)) {
    return;
  }
  emit("submit");
}

function addField(field: ValidatedField) {
  fields.push(field);
}

function removeField(field: ValidatedField) {
  const i = fields.indexOf(field);
  fields.splice(i, 1);
}

provide(addFieldKey, addField);
provide(removeFieldKey, removeField);

defineExpose({
  addField,
  removeField
});
</script>

<template>
  <form novalidate @submit.prevent="handleSubmit">
    <slot />
  </form>
</template>
