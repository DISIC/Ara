<script lang="ts" setup>
import { ref, useTemplateRef } from "vue";
import { EMAIL, REQUIRED } from "../../../composables/validation";
import DsfrFieldWithValidation from "../../validation/DsfrFieldWithValidation.vue";
import FormWithValidation from "../../validation/form-with-validation/FormWithValidation.vue";

const emit = defineEmits<{
  (e: "submit", email: string): void;
}>();

const email = ref("");
const emailField = useTemplateRef("email-field");

defineExpose({
  focusEmailField: () => {
    emailField.value?.focus();
  }
});
</script>

<template>
  <FormWithValidation class="wrapper" @submit="$emit('submit', email)">
    <h1 class="fr-h3">Réinitialiser votre mot de passe</h1>
    <p class="fr-mb-2w">
      Saisissez l’adresse e-mail liée à votre compte. Vous recevrez un e-mail pour réinitialiser votre mot de passe.
    </p>

    <DsfrFieldWithValidation
      id="reset-password-email"
      ref="email-field"
      v-model="email"
      label="Adresse e-mail"
      hint="Format attendu : nom@domaine.fr"
      type="email"
      required
      class="field-wrapper"
      :validation="[
        REQUIRED('Champ obligatoire. Saisissez votre adresse e-mail.'),
        EMAIL('Format incorrect. Utilisez le format : nom@domaine.fr.')
      ]"
    />

    <ul
      class="fr-btns-group fr-btns-group--right fr-btns-group--inline-lg fr-btns-group--icon-left"
    >
      <li>
        <RouterLink class="fr-btn fr-btn--secondary" :to="{ name: 'login' }">
          Annuler
        </RouterLink>
      </li>
      <li>
        <button type="submit" class="fr-btn">Valider</button>
      </li>
    </ul>
  </FormWithValidation>
</template>

<style scoped>
.field-wrapper {
  max-width: 25rem;
}
</style>
