<script setup lang="ts">
import { HTTPError } from "ky";
import { ref } from "vue";

import { useDevMode } from "../../../composables/useDevMode";
import { useNotifications } from "../../../composables/useNotifications";
import { useAccountStore } from "../../../store/account";
import {
  captureWithPayloads,
  formatEmail,
  validateEmail
} from "../../../utils";
import DsfrField from "../../ui/DsfrField.vue";
import DsfrPassword from "../../ui/DsfrPassword.vue";

const emit = defineEmits<{
  (e: "submit", payload: { username: string }): void;
}>();

const userEmail = ref("");
const userEmailField = ref<InstanceType<typeof DsfrField>>();
const userEmailError = ref<string>();

const userPassword = ref("");
const userPasswordField = ref<InstanceType<typeof DsfrPassword>>();
const userPasswordError = ref<string>();
const togglePasswordRef = ref<HTMLInputElement>();

const accountStore = useAccountStore();
const notify = useNotifications();

function validateEmailField() {
  userEmailError.value = undefined;

  // Empty email
  if (userEmail.value.trim().length === 0) {
    userEmailError.value =
      "Champ obligatoire. Veuillez choisir une adresse e-mail au format : nom@domaine.fr";
    userEmailField.value?.inputRef?.focus();
    return false;
  }

  // Invalid email format
  if (!validateEmail(userEmail.value)) {
    userEmailError.value =
      "Le format de l’adresse e-mail est incorrect. Veuillez saisir une adresse e-mail au format : nom@domaine.fr";
    userEmailField.value?.inputRef?.focus();
    return false;
  }

  return true;
}

function validatePasswordField() {
  userPasswordError.value = undefined;

  // Empty password
  if (userPassword.value.length === 0) {
    userPasswordError.value =
      "Champ obligatoire. Veuillez choisir un mot de passe de 12 caractères minimum.";
    userPasswordField.value?.inputRef?.focus();
    return false;
  }

  // Invalid password requirement
  if (userPassword.value.length < 12) {
    userPasswordError.value =
      "Le nombre de caractères du mot de passe n’est pas suffisant. Veuillez choisir un mot de passe de 12 caractères minimum.";
    userPasswordField.value?.inputRef?.focus();
    return false;
  }

  return true;
}

async function handleSubmit() {
  if (![validateEmailField(), validatePasswordField()].every((i) => i)) {
    // Invalid form
    return;
  }

  await accountStore
    .createAccount(formatEmail(userEmail.value), userPassword.value)
    .then(() => {
      emit("submit", { username: userEmail.value });

      if (togglePasswordRef.value) {
        togglePasswordRef.value.value = "false";
      }
    })
    .catch(async (err) => {
      if (err instanceof HTTPError) {
        const body = await err.response.json();

        if (err.response.status === 409) {
          // Email already used
          userEmailError.value =
            "Un compte est déjà associé à cette adresse e-mail. Veuillez choisir une autre adresse e-mail. Si vous êtes le propriétaire de cette adresse e-mail vous pouvez vous connecter.";
          userEmailField.value?.inputRef?.focus();
        } else if (
          err.response.status === 400 &&
          body.message.includes("username must be an email")
        ) {
          // Invalid email format
          userEmailError.value =
            "Le format de l’adresse e-mail est incorrect. Veuillez saisir une adresse e-mail au format : nom@domaine.fr";
          userEmailField.value?.inputRef?.focus();
        } else {
          // Unkown error
          notify(
            "error",
            "Echéc de la création de compte",
            "Une erreur inconnue est survenue"
          );
          captureWithPayloads(err, false);
        }
      }
    });
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
    <form novalidate @submit.prevent="handleSubmit">
      <h1 tabindex="-1" class="fr-mb-3w fr-h3">Créer votre compte Ara</h1>

      <p class="fr-text--sm fr-mb-2w mandatory-notice">
        Sauf mention contraire, tous les champs sont obligatoires.
      </p>

      <DsfrField
        id="user-email"
        ref="userEmailField"
        v-model="userEmail"
        class="fr-mb-2w"
        label="Adresse e-mail"
        hint="Format attendu : nom@domaine.fr"
        type="email"
        required
        :error="userEmailError"
      />

      <DsfrPassword
        id="user-password"
        ref="userPasswordField"
        v-model="userPassword"
        class="fr-mb-3w"
        label="Mot de passe"
        :error="userPasswordError"
        autocomplete="new-password"
        minlength="12"
        required
        :requirements="['12 caractères minimum']"
      />

      <ul
        class="fr-btns-group fr-btns-group--right fr-btns-group--inline-sm fr-btns-group--inline-reverse"
      >
        <li>
          <button class="fr-btn" type="submit">Valider</button>
        </li>
        <!-- TODO: what does this do ?? -->
        <!-- <li>
          <button class="fr-btn fr-btn--secondary">Annuler</button>
        </li> -->
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
