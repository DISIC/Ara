<script lang="ts" setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const password = ref("");

async function resetPassword() {
  // TODO: reset password
  console.log("resetPassword");
  router.push({
    name: "login",
    // TODO: prefill email with account store
    state: { email: "email", passwordReset: true },
  });
}
</script>

<template>
  <form class="wrapper" @submit.prevent="resetPassword">
    <h1 class="fr-h3">Changer de mot de passe</h1>

    <div class="fr-password fr-mb-3w">
      <label class="fr-label" for="user-password-input">Mot de passe</label>
      <div class="fr-input-wrap">
        <input
          id="user-password-input"
          v-model="password"
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
        <label class="fr-password__checkbox fr-label" for="user-password-show">
          Afficher
        </label>
      </div>
    </div>

    <ul
      class="fr-btns-group fr-btns-group--right fr-btns-group--inline-lg fr-btns-group--icon-left"
    >
      <li>
        <RouterLink class="fr-btn fr-btn--secondary" :to="{ name: 'login' }">
          Annuler
        </RouterLink>
      </li>
      <li>
        <button type="submit" class="fr-btn">Changer de mot de passe</button>
      </li>
    </ul>
  </form>
</template>

<style scoped>
.wrapper {
  max-width: 25rem;
  margin: 0 auto;
}
</style>
