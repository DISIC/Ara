<script setup lang="ts">
import { HTTPError } from "ky";
import { ref } from "vue";

import { useDevMode } from "../../../composables/useDevMode";
import { useNotifications } from "../../../composables/useNotifications";
import { useAccountStore } from "../../../store/account";
import { captureWithPayloads } from "../../../utils";
import DsfrField from "../../DsfrField.vue";

const emit = defineEmits<{
  (e: "submit", payload: { username: string }): void;
}>();

const userEmail = ref("");
const userPassword = ref("");
const userEmailInput = ref<HTMLInputElement>();
const userEmailError = ref<string>();

const accountStore = useAccountStore();
const notify = useNotifications();

async function handleSubmit() {
  userEmailError.value = undefined;

  await accountStore
    .createAccount(userEmail.value, userPassword.value)
    .then(() => {
      emit("submit", { username: userEmail.value });
    })
    .catch(async (err) => {
      if (err instanceof HTTPError) {
        const body = await err.response.json();

        if (err.response.status === 409) {
          // Email already used
          userEmailError.value =
            "Un compte est déjà associé à cette adresse e-mail. Veuillez choisir une autre adresse e-mail. Si vous êtes le propriétaire de cette adresse e-mail vous pouvez vous connecter.";
          userEmailInput.value?.focus();
        } else if (
          err.response.status === 400 &&
          body.message.includes("username must be an email")
        ) {
          // Invalid email format
          userEmailError.value =
            "Le format de l’adresse e-mail est incorrect. Veuillez saisir une adresse e-mail au format : nom@domaine.fr";
          userEmailInput.value?.focus();
        } else {
          // Unkown error
          notify(
            "error",
            "Echéc de la création de compte",
            "Une erreur inconnue est survenue"
          );
          captureWithPayloads(err);
        }
      }
    });
}

const isDevMode = useDevMode();

function fillFields() {
  const randomNumber = Math.floor(Math.random() * 1_000_000);
  userEmail.value = `email-${randomNumber}@example.com`;
  userPassword.value = "123456789098";
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

      <DsfrField
        id="user-email"
        v-model="userEmail"
        class="fr-mb-2w"
        label="Adresse e-mail"
        hint="Format attendu : nom@domaine.fr"
        type="email"
        required
        :error="userEmailError"
      />

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
            minlength="12"
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
