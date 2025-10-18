<script setup lang="ts">
import { ref } from "vue";
import DsfrPassword from "../components/ui/DsfrPassword.vue";
import DsfrFieldWithValidation from "../components/validation/DsfrFieldWithValidation.vue";
import FieldValidation from "../components/validation/FieldValidation.vue";
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
  <FormWithValidation class="wrapper" @submit="handleSubmit">
    <DsfrFieldWithValidation
      id="name-field"
      v-model="name"
      label="Votre nom"
      :validation="[REQUIRED('Ce champs est obligatoire')]"
    />

    <p>
      Ajouter ou retirer le champs ne pose aucun
      problème : le premier champs en erreur de la page est toujours celui
      qui prends le focus, qu’importe l’ordre dans lesquels les champs sont
      ajoutés à la page.
    </p>

    <div class="fr-checkbox-group">
      <input id="show-email-checkbox" v-model="showEmail" type="checkbox">
      <label class="fr-label" for="show-email-checkbox">
        Montrer le champs email
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

    <p>
      On peut utiliser <code>&lt;FieldValidation&gt;</code> pour valider
      n’importe quel champs
    </p>

    <!-- Usage with FieldValidation directly to validate any field -->
    <FieldValidation
      v-slot="{ error, focusRef }"
      :validation="[REQUIRED('Ce champs est obligatoire'), LENGTH(12, 'Pas assez long.')]"
      :value="thirdField"
    >
      <DsfrPassword
        id="user-password"
        :ref="focusRef"
        v-model="thirdField"
        :error="error"
        label="Mot de passe (<FieldValidation>)"
        required
        autocomplete="current-password"
      />
    </FieldValidation>

    <button class="fr-btn" type="submit">Valider</button>
  </FormWithValidation>
</template>

<style scoped>
.wrapper {
  max-width: 40rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
