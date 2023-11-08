<script lang="ts" setup>
import { ref } from "vue";

const emit = defineEmits<{
  (e: "submit", newPassword: string): void;
}>();

const password = ref("");
const passwordFieldRef = ref<HTMLInputElement>();
const passwordError = ref<string>();

function validatePasswordField() {
  passwordError.value = undefined;

  // Empty password
  if (password.value.length === 0) {
    passwordError.value =
      "Champ obligatoire. Veuillez choisir un mot de passe de 12 caractères minimum.";
    passwordFieldRef.value?.focus();
    return false;
  }

  // Invalid password requirement
  if (password.value.length < 12) {
    passwordError.value =
      "Le nombre de caractères du mot de passe n’est pas suffisant. Veuillez choisir un mot de passe de 12 caractères minimum.";
    passwordFieldRef.value?.focus();
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

    <div
      class="fr-password fr-mb-3w"
      :class="{ 'fr-input-group--error': !!passwordError }"
    >
      <label class="fr-label" for="user-password-input">Mot de passe</label>
      <div class="fr-input-wrap">
        <input
          id="user-password-input"
          v-model="password"
          :class="[
            'fr-password__input fr-input',
            { 'fr-input--error': !!passwordError },
          ]"
          :aria-describedby="
            passwordError
              ? 'user-password-error'
              : 'user-password-input-messages'
          "
          aria-required="true"
          autocomplete="new-password"
          type="password"
          required
          minlength="12"
        />
      </div>

      <p v-if="passwordError" id="user-password-error" class="fr-error-text">
        {{ passwordError }}
      </p>

      <div
        v-else
        id="user-password-input-messages"
        class="fr-messages-group"
        aria-live="assertive"
      >
        <p class="fr-message">Votre mot de passe doit contenir :</p>
        <p class="fr-message fr-message--info">12 caractères minimum</p>
      </div>

      <div
        class="fr-password__checkbox fr-checkbox-group fr-checkbox-group--sm"
      >
        <input
          id="user-password-show"
          ref="passwordFieldRef"
          aria-label="Afficher le mot de passe"
          type="checkbox"
          aria-describedby="user-password-show-messages"
        />
        <label class="fr-password__checkbox fr-label" for="user-password-show">
          Afficher
        </label>
      </div>
    </div>

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
