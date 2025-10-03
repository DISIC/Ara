<script setup lang="ts">
import { ref } from "vue";
import DsfrFieldWithValidation from "../components/ui/DsfrFieldWithValidation.vue";
import FormWithValidation from "../components/ui/form-with-validation/FormWithValidation.vue";
import { EMAIL, LENGTH, REQUIRED } from "../composables/validation";

const name = ref("");
const email = ref("");

const showEmail = ref(true);

function handleSubmit() {
  console.log("form validated", name.value, email.value);
}
</script>

<template>
  <FormWithValidation @submit="handleSubmit">
    <DsfrFieldWithValidation
      id="name-field"
      v-model="name"
      label="Votre nom"
      :validation="[
        REQUIRED('Ce champs est obligatoire'),
        LENGTH(12, 'Désolé, on accepte que ce·lles·eux avec un grand nom (12 caractères minimum)')
      ]"
    />

    <div>
      <label for="show-email-checkbox">Montrer le champs email</label>
      <input id="show-email-checkbox" v-model="showEmail" type="checkbox" />
    </div>

    <DsfrFieldWithValidation
      v-if="showEmail"
      id="email-field"
      v-model="email"
      label="Votre adresse email"
      hint="Ce champs peut être ajouté ou retiré du formulaire sans problème"
      :validation="[
        REQUIRED('Ce champs est obligatoire'),
        EMAIL('Précisez votre adrnesse email au format blablabla')
      ]"
    />

    <button type="submit">Valider</button>
  </FormWithValidation>
  {{ name }}
  {{ email }}
</template>
