<script lang="ts" setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

import { useAccountStore } from "../../store/account";
import { history } from "../../router";

const userEmail = ref((history.state.email as string) ?? "");
const userPassword = ref("");
const rememberMe = ref(false);
const showCreatedAccountAlert = ref(!!history.state.email);

const store = useAccountStore();
const router = useRouter();

async function handleSubmit() {
  await store.login(userEmail.value, userPassword.value, rememberMe.value);
  router.push({ name: "account-dashboard" });
}
</script>

<template>
  <!-- TODO: fix top spacing -->
  <div
    v-if="showCreatedAccountAlert"
    class="fr-alert fr-alert--success fr-mb-4w"
  >
    <h3 class="fr-alert__title">Votre compte a été créé avec succès</h3>
    <p>Connectez-vous pour accédez à votre espace.</p>
    <button
      class="fr-btn--close fr-btn"
      title="Masquer le message"
      @click="showCreatedAccountAlert = false"
    >
      Masquer le message
    </button>
  </div>

  <div class="wrapper">
    <form @submit.prevent="handleSubmit">
      <h1 class="fr-h3">Connexion à Ara</h1>

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

      <RouterLink to="#" class="fr-link">Mot de passe oublié ?</RouterLink>

      <div class="fr-checkbox-group fr-checkbox-group--sm fr-my-3w">
        <input
          id="remember-me"
          v-model="rememberMe"
          type="checkbox"
          aria-describedby="remember-me-messages"
        />
        <label class="fr-label" for="remember-me">Se souvenir de moi</label>
        <div
          id="remember-me-messages"
          class="fr-messages-group"
          aria-live="assertive"
        ></div>
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
