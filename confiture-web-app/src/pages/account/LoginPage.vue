<script lang="ts" setup>
import { HTTPError } from "ky";
import { nextTick, ref } from "vue";
import { useRouter } from "vue-router";

import PageMeta from "../../components/PageMeta";
import DsfrField from "../../components/ui/DsfrField.vue";
import DsfrPassword from "../../components/ui/DsfrPassword.vue";
import { useNotifications } from "../../composables/useNotifications";
import { history } from "../../router";
import { useAccountStore } from "../../store/account";
import { captureWithPayloads, validateEmail } from "../../utils";

const showGenericLoginError = ref(false);
const genericErrorRef = ref<HTMLDivElement>();

const userEmail = ref((history.state.email as string) ?? "");
const userEmailError = ref<string>();
const userEmailField = ref<InstanceType<typeof DsfrField>>();

const userPassword = ref("");
const userPasswordError = ref<string>();
const userPasswordRef = ref<InstanceType<typeof DsfrPassword>>();

const showCreatedAccountAlert = ref(!!history.state.email);
const showPasswordResetAlert = ref(history.state.passwordReset);

async function closeAlert() {
  showCreatedAccountAlert.value = false;
  showPasswordResetAlert.value = false;
  await nextTick();
  userEmailField.value?.inputRef?.focus();
}

const store = useAccountStore();
const router = useRouter();
const notify = useNotifications();

function validateEmailField() {
  userEmailError.value = undefined;

  // Empty email
  if (!userEmail.value.trim()) {
    userEmailError.value =
      "Champ obligatoire. Veuillez saisir l'adresse e-mail associée à votre compte";
    userEmailField.value?.inputRef?.focus();
    return false;
  }

  // Invalid email format
  if (!validateEmail(userEmail.value)) {
    userEmailError.value =
      "Le format de l’adresse e-mail est incorrect. Veuillez saisir une adresse e-mail au format : nom@domaine.fr";
    userEmailField.value?.inputRef?.focus();
    return false;
  }

  return true;
}

function validatePasswordField() {
  userPasswordError.value = undefined;

  // Empty password
  if (!userPassword.value.length) {
    userPasswordError.value =
      "Champ obligatoire. Veuillez saisir votre mot de passe";
    userPasswordRef.value?.inputRef?.focus();
    return false;
  }

  return true;
}

async function handleSubmit() {
  if (![validatePasswordField(), validateEmailField()].every((i) => i)) {
    // Invalid form
    return;
  }

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
    <form novalidate @submit.prevent="handleSubmit">
      <h1 class="fr-h3">Connexion à Ara</h1>

      <div v-if="showGenericLoginError" ref="genericErrorRef" tabindex="-1" class="fr-alert fr-alert--sm fr-alert--error fr-mb-3w">
        <p>L’adresse e-mail ou le mot de passe saisi est incorrect. Vérifiez vos saisies.</p>
      </div>

      <DsfrField
        id="user-email"
        ref="userEmailField"
        v-model="userEmail"
        label="Adresse e-mail"
        hint="Format attendu : nom@domaine.fr"
        type="email"
        required
        autocomplete="email"
        :error="userEmailError"
      />

      <DsfrPassword
        id="user-password"
        ref="userPasswordRef"
        v-model="userPassword"
        class="fr-my-3w"
        :error="userPasswordError"
        label="Mot de passe"
        required
        autocomplete="current-password"
        show-forgotten-password-link
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
