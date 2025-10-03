<script setup lang="ts">
import { HTTPError } from "ky";
import { ref } from "vue";

import { useDevMode } from "../../../composables/useDevMode";
import { useNotifications } from "../../../composables/useNotifications";
import {
  EMAIL,
  LENGTH,
  REQUIRED,
  useFormField,
  validate
} from "../../../composables/validation";
import { useAccountStore } from "../../../store/account";
import { captureWithPayloads, formatEmail } from "../../../utils";
import DsfrField from "../../ui/DsfrField.vue";
import DsfrPassword from "../../ui/DsfrPassword.vue";

const emit = defineEmits<{
  (e: "submit", payload: { username: string }): void;
}>();

const togglePasswordRef = ref<HTMLInputElement>();

const userEmail = useFormField<string>((history.state.email as string) ?? "", [
  REQUIRED("Champ obligatoire. Saisissez votre adresse e-mail."),
  EMAIL("Format incorrect. Utilisez le format : nom@domaine.fr.")
]);

const userPassword = useFormField<string>("", [
  REQUIRED("Champ obligatoire. Saisissez un mot de passe."),
  LENGTH(
    12,
    "Le nombre de caractères du mot de passe n’est pas suffisant. Veuillez choisir un mot de passe de 12 caractères minimum."
  )
]);

const accountStore = useAccountStore();
const notify = useNotifications();

async function handleSubmit() {
  if (!validate(userEmail, userPassword)) {
    // Invalid form
    return;
  }

  await accountStore
    .createAccount(formatEmail(userEmail.value.value), userPassword.value.value)
    .then(() => {
      emit("submit", { username: userEmail.value.value });

      if (togglePasswordRef.value) {
        togglePasswordRef.value.value = "false";
      }
    })
    .catch(async (err) => {
      if (err instanceof HTTPError) {
        const body = await err.response.json();

        if (err.response.status === 409) {
          // Email already used
          userEmail.error.value =
            "Cette adresse e-mail est déjà associée à un compte. Connectez-vous.";
          userEmail.focusRef.value?.focus();
        } else if (
          err.response.status === 400 &&
          body.message.includes("username must be an email")
        ) {
          // Invalid email format
          userEmail.error.value =
            "Format incorrect. Utilisez le format : nom@domaine.fr.";
          userEmail.focusRef.value?.focus();
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
  userEmail.value.value = `email-${randomNumber}@example.com`;
  userPassword.value.value = "123blabla!!!Pouet";
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
        :ref="userEmail.refFn"
        :model-value="userEmail.value.value"
        class="fr-mb-2w"
        label="Adresse e-mail"
        hint="Format attendu : nom@domaine.fr"
        type="email"
        required
        :error="userEmail.error.value"
        @update:model-value="userEmail.value.value = $event"
      />

      <DsfrPassword
        id="user-password"
        :ref="userPassword.refFn"
        :model-value="userPassword.value.value"
        class="fr-mb-3w"
        label="Mot de passe"
        :error="userPassword.error.value"
        autocomplete="new-password"
        minlength="12"
        required
        :requirements="['12 caractères minimum']"
        @update:model-value="userPassword.value.value = $event"
      />

      <div class="fr-btns-group">
        <button class="fr-btn fr-mb-0" type="submit">Valider</button>
      </div>
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
