<script setup lang="ts">
import { ref } from "vue";
import DsfrFieldWithValidation from "../components/validation/DsfrFieldWithValidation.vue";
import FormWithValidation from "../components/validation/form-with-validation/FormWithValidation.vue";
import { EMAIL, LENGTH, REQUIRED } from "../composables/validation";

const name = ref("John MacManPerson");
const email = ref("");
const thirdField = ref("");

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

    <div class="fr-checkbox-group">
      <input id="show-email-checkbox" v-model="showEmail" type="checkbox">
      <label class="fr-label" for="show-email-checkbox">
        Montrer le champs email
        <span class="fr-hint-text">Ajouter ou retirer le champs ne pose aucun problème</span>
      </label>
    </div>

    <DsfrFieldWithValidation
      v-if="showEmail"
      id="email-field"
      v-model="email"
      label="Votre adresse email"
      :validation="[
        REQUIRED('Ce champs est obligatoire'),
        EMAIL('Précisez votre adrnesse email au format blablabla')
      ]"
    />

    <DsfrFieldWithValidation
      id="third-field"
      v-model="thirdField"
      label="Troisième champs"
      :validation="[
        REQUIRED('Ce champs est obligatoire')
      ]"
    />

    <button type="submit">Valider</button>
  </FormWithValidation>
</template>
