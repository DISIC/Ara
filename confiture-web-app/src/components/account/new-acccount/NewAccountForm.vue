<script setup lang="ts">
import { ref } from "vue";

import { useDevMode } from "../../../composables/useDevMode";

const emit = defineEmits<{
  (e: "submit", payload: { username: string; password: string }): void;
}>();

const userEmail = ref("");
const userPassword = ref("");

function handleSubmit() {
  // TODO: validate fields
  emit("submit", { username: userEmail.value, password: userPassword.value });
}

const isDevMode = useDevMode();

function fillFields() {
  const randomNumber = Math.floor(Math.random() * 1_000_000);
  userEmail.value = `email-${randomNumber}@example.com`;
  userPassword.value = "123blabla!!!Pouet";
}
</script>

<template>
  <button v-if="isDevMode" class="fr-btn" @click="fillFields">
    [DEV] Remplir les champs
  </button>
  <div class="wrapper">
    <form @submit.prevent="handleSubmit">
      <h1 tabindex="-1" class="fr-mb-3w fr-h3">Créer votre compte Ara</h1>

      <p class="fr-text--sm fr-mb-2w mandatory-notice">
        Sauf mention contraire, tous les champs sont obligatoires.
      </p>

      <div class="fr-input-group fr-mb-2w">
        <label class="fr-label" for="user-email">
          Adresse e-mail
          <span class="fr-hint-text">Format attendu : nom@domaine.fr</span>
        </label>
        <input
          id="user-email"
          v-model="userEmail"
          class="fr-input"
          type="email"
          required
        />
      </div>

      <div class="fr-password fr-mb-3w">
        <label class="fr-label" for="user-password-input">Mot de passe</label>
        <div class="fr-input-wrap">
          <input
            id="user-password-input"
            v-model="userPassword"
            class="fr-password__input fr-input"
            aria-describedby="user-password-input-messages"
            aria-required="true"
            autocomplete="new-password"
            type="password"
            required
          />
        </div>

        <div
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
            aria-label="Afficher le mot de passe"
            type="checkbox"
            aria-describedby="user-password-show-messages"
          />
          <label
            class="fr-password__checkbox fr-label"
            for="user-password-show"
          >
            Afficher
          </label>
          <div
            id="user-password-show-messages"
            class="fr-messages-group"
            aria-live="assertive"
          ></div>
        </div>
      </div>
      <ul
        class="fr-btns-group fr-btns-group--right fr-btns-group--inline-sm fr-btns-group--inline-reverse"
      >
        <li>
          <button class="fr-btn" type="submit">Valider</button>
        </li>
        <li>
          <!-- TODO: what does this do ?? -->
          <button class="fr-btn fr-btn--secondary">Annuler</button>
        </li>
      </ul>
    </form>
  </div>
</template>

<style scoped>
.wrapper {
  margin: 0 auto;
  max-width: 25rem;
}

.mandatory-notice {
  color: var(--text-mention-grey);
}
</style>
