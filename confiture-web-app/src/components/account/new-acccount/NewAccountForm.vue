<script setup lang="ts">
import { HTTPError } from "ky";
import { ref, useTemplateRef } from "vue";

import { useDevMode } from "../../../composables/useDevMode";
import { useNotifications } from "../../../composables/useNotifications";
import {
  EMAIL,
  LENGTH,
  REQUIRED
} from "../../../composables/validation";
import { useAccountStore } from "../../../store/account";
import { captureWithPayloads, formatEmail } from "../../../utils";
import DsfrFieldWithValidation from "../../validation/DsfrFieldWithValidation.vue";
import DsfrPasswordWithValidation from "../../validation/DsfrPasswordWithValidation.vue";
import FormWithValidation from "../../validation/form-with-validation/FormWithValidation.vue";

const emit = defineEmits<{
  (e: "submit", payload: { username: string }): void;
}>();

const togglePasswordRef = ref<HTMLInputElement>();

const userEmail = ref((history.state.email as string) ?? "");
const userPassword = ref("");

const emailField = useTemplateRef("email-field");

const accountStore = useAccountStore();
const notify = useNotifications();

async function handleSubmit() {
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
          emailField.value?.setError("Cette adresse e-mail est déjà associée à un compte. Connectez-vous.", true);
        } else if (
          err.response.status === 400 &&
          body.message.includes("username must be an email")
        ) {
          emailField.value?.setError("Format incorrect. Utilisez le format : nom@domaine.fr.", true);
        } else {
          // Unkown error
          notify(
            "error",
            "Échec de la création de compte",
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
    <FormWithValidation @submit="handleSubmit">
      <h1 tabindex="-1" class="fr-mb-3w fr-h3">Créer votre compte Ara</h1>

      <p class="fr-text--sm fr-mb-2w mandatory-notice">
        Sauf mention contraire, tous les champs sont obligatoires.
      </p>

      <DsfrFieldWithValidation
        id="user-email"
        ref="email-field"
        v-model="userEmail"
        class="fr-mb-2w"
        label="Adresse e-mail"
        hint="Format attendu : nom@domaine.fr"
        type="email"
        required
        :validation="[
          REQUIRED('Champ obligatoire. Saisissez votre adresse e-mail.'),
          EMAIL('Format incorrect. Utilisez le format : nom@domaine.fr.')
        ]"
      />

      <DsfrPasswordWithValidation
        id="user-password"
        v-model="userPassword"
        class="fr-mb-3w"
        label="Mot de passe"
        autocomplete="new-password"
        :min-length="12"
        required
        :requirements="['12 caractères minimum']"
        :validation="[
          REQUIRED('Champ obligatoire. Saisissez un mot de passe.'),
          LENGTH(12, 'Le nombre de caractères du mot de passe n’est pas suffisant. Veuillez choisir un mot de passe de 12 caractères minimum.')
        ]"
      />

      <div class="fr-btns-group">
        <button class="fr-btn fr-mb-0" type="submit">Valider</button>
      </div>
    </FormWithValidation>
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
