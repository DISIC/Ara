<script lang="ts" setup>
import { LENGTH, REQUIRED, useFormField, validate } from "../../../composables/validation";
import DsfrPassword from "../../ui/DsfrPassword.vue";

const emit = defineEmits<{
  (e: "submit", newPassword: string): void;
}>();

const password = useFormField("" as string, [
  REQUIRED("Champ obligatoire. Saisissez votre nouveau mot de passe. Il doit contenir 12 caractères minimum."),
  LENGTH(12, "Le nombre de caractères du mot de passe n’est pas suffisant. Veuillez choisir un mot de passe de 12 caractères minimum.")
]);

function submitPassword() {
  if (validate(password)) {
    emit("submit", password.value.value);
  }
}
</script>

<template>
  <form
    class="new-password-wrapper"
    novalidate
    @submit.prevent="submitPassword"
  >
    <h1 class="fr-h3">Changer de mot de passe</h1>

    <DsfrPassword
      id="user-password-input"
      :ref="password.refFn"
      :model-value="password.value.value"
      :error="password.error.value"
      class="fr-mb-3w"
      label="Mot de passe"
      required
      autocomplete="new-password"
      :min-length="12"
      :requirements="['12 caractères minimum']"
      @update:model-value="password.value.value = $event"
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
        <button type="submit" class="fr-btn">Changer de mot de passe</button>
      </li>
    </ul>
  </form>
</template>

<style scoped>
.new-password-wrapper {
  max-width: 25rem;
  margin: 0 auto;
}
</style>
