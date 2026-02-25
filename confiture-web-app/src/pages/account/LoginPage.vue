<script lang="ts" setup>
import { HTTPError } from "ky";
import { nextTick, ref, useTemplateRef } from "vue";
import { useRouter } from "vue-router";

import PageMeta from "../../components/PageMeta";
import DsfrFieldWithValidation from "../../components/validation/DsfrFieldWithValidation.vue";
import DsfrPasswordWithValidation from "../../components/validation/DsfrPasswordWithValidation.vue";
import FormWithValidation from "../../components/validation/form-with-validation/FormWithValidation.vue";
import { useNotifications } from "../../composables/useNotifications";
import {
  EMAIL,
  REQUIRED
} from "../../composables/validation";
import { DEFAULT_NOTIFICATION_ERROR_DESCRIPTION } from "../../enums";
import { history } from "../../router";
import { useAccountStore } from "../../store/account";
import { captureWithPayloads } from "../../utils";

const showGenericLoginError = ref(false);
const genericErrorRef = ref<HTMLDivElement>();

const userEmail = ref(history.state.email as string ?? "");
const userPassword = ref("");

const showCreatedAccountAlert = ref(!!history.state.email);
const showPasswordResetAlert = ref(history.state.passwordReset);

const emailFieldRef = useTemplateRef("emailField");

async function closeAlert() {
  showCreatedAccountAlert.value = false;
  showPasswordResetAlert.value = false;
  await nextTick();
  emailFieldRef.value?.focus();
}

const store = useAccountStore();
const router = useRouter();
const notify = useNotifications();

async function handleSubmit() {
  store
    .login(userEmail.value, userPassword.value)
    .then(() => {
      router.push({ name: "account-dashboard" });
    })
    .catch(async (err) => {
      if (err instanceof HTTPError && err.response.status === 401) {
        // Unknown user or wrong password
        showGenericLoginError.value = true;
        await nextTick();
        genericErrorRef.value?.focus();
      } else {
        // Unknown error
        notify(
          "error",
          "Échec de la connexion",
          DEFAULT_NOTIFICATION_ERROR_DESCRIPTION
        );
        captureWithPayloads(err, false);
      }
    });
}
</script>

<template>
  <PageMeta title="Connexion" />
  <!-- TODO: fix top spacing -->
  <div
    v-if="showPasswordResetAlert || showCreatedAccountAlert"
    class="fr-alert fr-alert--success fr-mb-4w"
  >
    <h3 class="fr-alert__title">
      {{
        showPasswordResetAlert
          ? "Votre mot de passe a été mis à jour avec succès"
          : "Votre compte a bien été créé"
      }}
    </h3>
    <p>Connectez-vous pour accédez à votre espace.</p>
    <button
      class="fr-btn--close fr-btn"
      title="Masquer le message"
      @click="closeAlert"
    >
      Masquer le message
    </button>
  </div>

  <div class="wrapper">
    <FormWithValidation @submit="handleSubmit">
      <h1 class="fr-h3">Connexion à Ara</h1>

      <div v-if="showGenericLoginError" ref="genericErrorRef" tabindex="-1" class="fr-alert fr-alert--sm fr-alert--error fr-mb-3w">
        <p>L’adresse e-mail ou le mot de passe saisi est incorrect. Vérifiez vos saisies.</p>
      </div>

      <DsfrFieldWithValidation
        id="user-email"
        ref="emailField"
        v-model="userEmail"
        label="Adresse e-mail"
        hint="Format attendu : nom@domaine.fr"
        type="email"
        required
        autocomplete="email"
        :validation="[REQUIRED('Champ obligatoire. Saisissez votre adresse e-mail.'),
                      EMAIL('Format incorrect. Utilisez le format : nom@domaine.fr.')]"
      />

      <DsfrPasswordWithValidation
        id="user-password"
        v-model="userPassword"
        class="fr-my-3w"
        label="Mot de passe"
        required
        autocomplete="current-password"
        show-forgotten-password-link
        :validation="[REQUIRED('Champ obligatoire. Saisissez votre mot de passe.')]"
      />

      <div class="fr-btns-group">
        <button class="fr-btn fr-mb-0">Se connecter</button>
      </div>
    </FormWithValidation>

    <div>
      <hr class="fr-mt-3w" />

      <h2 class="fr-h5">Vous n’avez pas de compte ?</h2>

      <div class="fr-btns-group fr-mb-3w">
        <RouterLink
          class="fr-btn fr-btn--secondary fr-mb-0"
          :to="{ name: 'new-account' }"
        >
          Créer un compte
        </RouterLink>
      </div>
    </div></div>
</template>

<style scoped>
.wrapper {
  max-width: 25rem;
  margin: 0 auto;
}
</style>
