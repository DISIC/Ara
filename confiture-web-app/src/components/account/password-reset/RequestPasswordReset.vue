<script lang="ts" setup>
import { EMAIL, REQUIRED, useFormField, validate } from "../../../composables/validation";
import DsfrField from "../../ui/DsfrField.vue";

const emit = defineEmits<{
  (e: "submit", email: string): void;
}>();

const email = useFormField("" as string, [
  REQUIRED("Champ obligatoire. Saisissez votre adresse e-mail."),
  EMAIL("Le format de l’adresse e-mail est incorrect. Veuillez saisir une adresse e-mail au format : nom@domaine.fr")
]);

defineExpose({
  focusEmailField: () => {
    email.focusRef.value?.focus();
  }
});

function onSubmit() {
  if (validate(email)) {
    emit("submit", email.value.value);
  }
}
</script>

<template>
  <form class="wrapper" novalidate @submit.prevent="onSubmit">
    <h1 class="fr-h3">Réinitialiser votre mot de passe</h1>
    <p class="fr-mb-2w">
      Saisissez l’adresse e-mail liée à votre compte. Vous recevrez un e-mail pour réinitialiser votre mot de passe.
    </p>

    <DsfrField
      id="reset-password-email"
      :ref="email.refFn"
      label="Adresse e-mail" hint="Format attendu : nom@domaine.fr"
      type="email"
      required
      :model-value="email.value.value"
      :error="email.error.value"
      @update:model-value="email.value.value = $event"
      class="field-wrapper"
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
  </form>
</template>

<style scoped>
.field-wrapper {
  max-width: 25rem;
}
</style>
