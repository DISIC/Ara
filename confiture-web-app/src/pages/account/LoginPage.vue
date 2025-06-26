<script lang="ts" setup>
import { HTTPError } from "ky";
import { nextTick, ref } from "vue";
import { useRouter } from "vue-router";

import PageMeta from "../../components/PageMeta";
import DsfrField from "../../components/ui/DsfrField.vue";
import DsfrPassword from "../../components/ui/DsfrPassword.vue";
import { useNotifications } from "../../composables/useNotifications";
import {
  EMAIL,
  REQUIRED,
  useFormField,
  validate
} from "../../composables/validation";
import { history } from "../../router";
import { useAccountStore } from "../../store/account";
import { captureWithPayloads } from "../../utils";

const userEmail = useFormField((history.state.email as string) ?? "", [
  REQUIRED("Champ obligatoire. Saisissez votre adresse e-mail."),
  EMAIL(
    "Le format de l’adresse e-mail est incorrect. Veuillez saisir une adresse e-mail au format : nom@domaine.fr"
  )
]);

const userPassword = useFormField("", [
  REQUIRED("Champ obligatoire. Saisissez votre mot de passe.")
]);

const showCreatedAccountAlert = ref(!!history.state.email);
const showPasswordResetAlert = ref(history.state.passwordReset);

async function closeAlert() {
  showCreatedAccountAlert.value = false;
  showPasswordResetAlert.value = false;
  await nextTick();
  userEmail.focusRef.value?.focus();
}

const store = useAccountStore();
const router = useRouter();
const notify = useNotifications();

async function handleSubmit() {
  if (!validate(userEmail, userPassword)) {
    return;
  }

  store
    .login(userEmail.value.value, userPassword.value.value)
    .then(() => {
      router.push({ name: "account-dashboard" });
    })
    .catch(async (err) => {
      if (err instanceof HTTPError && err.response.status === 401) {
        const body = await err.response.json();
        if (body.message === "unknown_user") {
          // Unknown user
          userEmail.error.value =
            "Cette adresse e-mail n’est associée à aucun compte. Veuillez vérifier la saisie de votre adresse e-mail.";
          userEmail.focusRef.value?.focus();
        } else {
          // Wrong password
          userPassword.value.value = "Le mot de passe saisi est incorrect.";
          userPassword.focusRef.value?.focus();
        }
      } else {
        // Unknown error
        notify(
          "error",
          "Échec de la connexion",
          "Une erreur inconnue est survenue"
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
          : "Votre compte a été créé avec succès"
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
    <form novalidate @submit.prevent="handleSubmit">
      <h1 class="fr-h3">Connexion à Ara</h1>

      <DsfrField
        id="user-email"
        :ref="userEmail.refFn"
        :model-value="userEmail.value.value"
        label="Adresse e-mail"
        hint="Format attendu : nom@domaine.fr"
        type="email"
        required
        autocomplete="email"
        :error="userEmail.error.value"
        @update:model-value="userEmail.value.value = $event"
      />

      <DsfrPassword
        id="user-password"
        :ref="userPassword.refFn"
        :model-value="userPassword.value.value"
        class="fr-my-3w"
        :error="userPassword.error.value"
        label="Mot de passe"
        required
        autocomplete="current-password"
        show-forgotten-password-link
        @update:model-value="userPassword.value.value = $event"
      />

      <div class="fr-btns-group">
        <button class="fr-btn fr-mb-0">Se connecter</button>
      </div>
    </form>

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
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  max-width: 25rem;
  margin: 0 auto;
}
</style>
