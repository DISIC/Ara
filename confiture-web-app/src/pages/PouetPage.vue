<script setup lang="ts">
import DsfrField from "../components/ui/DsfrField.vue";
import {
  LENGTH,
  REQUIRED,
  useFormField,
  validate
} from "../composables/validation";

const myField = useFormField("", [
  REQUIRED("Nuh huh ! This field is required"),
  LENGTH(10, "This should be at least 10 characters long")
]);

const mySecondField = useFormField("", [REQUIRED("this is also required !")]);

function handleSubmit() {
  if (!validate(myField, mySecondField)) {
    return;
  }

  console.log("Sending data...");
}
</script>

<template>
  <form novalidate @submit.prevent="handleSubmit">
    <DsfrField
      id="my-field"
      :ref="myField.refFn"
      label="My field"
      :model-value="myField.value.value"
      :error="myField.error.value"
      @update:model-value="myField.value.value = $event"
    />

    <DsfrField
      id="my-second-field"
      :ref="mySecondField.refFn"
      label="Second field"
      :model-value="mySecondField.value.value"
      :error="mySecondField.error.value"
      @update:model-value="mySecondField.value.value = $event"
    />
    <button type="submit">Valider</button>
  </form>
  <p>{{ myField.value }}</p>
</template>
