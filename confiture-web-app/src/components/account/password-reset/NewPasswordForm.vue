<script lang="ts" setup>
import { ref } from "vue";

import DsfrPassword from "../../DsfrPassword.vue";

const emit = defineEmits<{
  (e: "submit", newPassword: string): void;
}>();

const password = ref("");
const passwordFieldRef = ref<InstanceType<typeof DsfrPassword>>();
const passwordError = ref<string>();

function validatePasswordField() {
  passwordError.value = undefined;

  // Empty password
  if (password.value.length === 0) {
    passwordError.value =
      "Champ obligatoire. Veuillez choisir un mot de passe de 12 caractères minimum.";
    passwordFieldRef.value?.inputRef?.focus();
    return false;
  }

  // Invalid password requirement
  if (password.value.length < 12) {
    passwordError.value =
      "Le nombre de caractères du mot de passe n’est pas suffisant. Veuillez choisir un mot de passe de 12 caractères minimum.";
    passwordFieldRef.value?.inputRef?.focus();
    return false;
  }

  return true;
}

function submitPassword() {
  if (validatePasswordField()) {
    emit("submit", password.value);
  }
}
</script>

<template>
  <form class="wrapper" novalidate @submit.prevent="submitPassword">
    <h1 class="fr-h3">Changer de mot de passe</h1>

    <DsfrPassword
      id="user-password-input"
      ref="passwordFieldRef"
      v-model="password"
      class="fr-mb-3w"
      :error="passwordError"
      label="Mot de passe"
      required
      autocomplete="new-password"
      :min-length="12"
      :requirements="['12 caractères minimum']"
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
.wrapper {
  max-width: 25rem;
  margin: 0 auto;
}
</style>
