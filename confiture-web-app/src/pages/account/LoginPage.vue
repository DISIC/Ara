<script lang="ts" setup>
import { ref, nextTick } from "vue";
import { useRouter } from "vue-router";

import { useAccountStore } from "../../store/account";
import { history } from "../../router";
import DsfrField from "../../components/DsfrField.vue";
import { useNotifications } from "../../composables/useNotifications";
import { HTTPError } from "ky";
import { captureWithPayloads } from "../../utils";

const userEmail = ref((history.state.email as string) ?? "");
const userEmailError = ref<string>();
const userEmailField = ref<InstanceType<typeof DsfrField>>();

const userPassword = ref("");
const userPasswordError = ref<string>();
const userPasswordInput = ref<HTMLInputElement>();

const rememberMe = ref(false);

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

async function handleSubmit() {
  store
    .login(userEmail.value, userPassword.value, rememberMe.value)
    .then(() => {
      router.push({ name: "account-dashboard" });
    })
    .catch(async (err) => {
      if (err instanceof HTTPError && err.response.status === 401) {
        const body = await err.response.json();
        if (body.message === "unknown_user") {
          // Unknown user
          userEmailError.value =
            "Cette adresse e-mail est associée à aucun compte. Veuillez vérifier la saisie de votre adresse e-mail.";
          userEmailField.value?.inputRef?.focus();
        } else {
          // Wrong password
          userPasswordError.value = "Le mot de passe saisi est incorrect.";
          userPasswordInput.value?.focus();
        }
      } else {
        // Unknown error
        notify(
          "error",
          "Echéc de la connexion",
          "Une erreur inconnue est survenue"
        );
        captureWithPayloads(err, false);
      }
    });
}
</script>

<template>
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
    <form @submit.prevent="handleSubmit">
      <h1 class="fr-h3">Connexion à Ara</h1>

      <DsfrField
        id="user-email"
        ref="userEmailField"
        v-model="userEmail"
        label="Adresse e-mail"
        hint="Format attendu : nom@domaine.fr"
        type="email"
        required
        :error="userEmailError"
      />

      <div
        class="fr-password fr-mb-3v"
        :class="{ 'fr-input-group--error': !!userPasswordError }"
      >
        <label class="fr-label" for="user-password-input">Mot de passe</label>
        <div class="fr-input-wrap">
          <input
            id="user-password-input"
            ref="userPasswordInput"
            v-model="userPassword"
            class="fr-password__input fr-input"
            :aria-describedby="
              userPasswordError ? 'user-password-error' : undefined
            "
            aria-required="true"
            autocomplete="new-password"
            type="password"
            required
          />
        </div>

        <p
          v-if="userPasswordError"
          id="user-password-error"
          class="fr-error-text"
        >
          {{ userPasswordError }}
        </p>

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

      <RouterLink :to="{ name: 'password-reset' }" class="fr-link">
        Mot de passe oublié ?
      </RouterLink>

      <div class="fr-checkbox-group fr-checkbox-group--sm fr-my-3w">
        <input id="remember-me" v-model="rememberMe" type="checkbox" />
        <label class="fr-label" for="remember-me">Se souvenir de moi</label>
      </div>

      <div class="fr-btns-group">
        <button class="fr-btn fr-mb-0">Se connecter</button>
      </div>
    </form>

    <div>
      <hr class="fr-mt-3w" />

      <h2 class="fr-h5">Vous n’avez pas de compte ?</h2>

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
