<script lang="ts" setup>
import { ref, nextTick } from "vue";

// Reset password
const email = ref("");
const instructionsHeadingRef = ref<HTMLHeadingElement>();
const showInstructions = ref(false);

async function resetPassword() {
  // TODO: resend email
  showInstructions.value = true;
  await nextTick();
  instructionsHeadingRef.value?.focus();
}

// Resend email
const resendEmailButtonRef = ref<HTMLButtonElement>();
const showResendAlert = ref(false);

async function resendEmail() {
  // TODO: resend email
  showResendAlert.value = true;
}

async function hideResendAlert() {
  showResendAlert.value = false;
  await nextTick();
  resendEmailButtonRef.value?.focus();
}

// Update email
const emailFieldRef = ref<HTMLInputElement>();

async function updateEmail() {
  showInstructions.value = false;
  await nextTick();
  emailFieldRef.value?.focus();
}
</script>

<template>
  <div v-if="showInstructions" class="instructions-wrapper">
    <h1 ref="instructionsHeadingRef" class="fr-h3" tabindex="-1">
      Consulter votre boite de réception
    </h1>
    <p class="fr-mb-6w">
      Un lien de réinitialisation vient de vous être envoyé à l’adresse e-mail
      suivante : <strong>{{ email }}</strong>
    </p>
    <h2 class="fr-text--sm fr-mb-1w">Aucun e-mail reçu ?</h2>
    <p class="fr-mb-1w">
      Pensez à vérifier que vous n’avez pas reçu l’e-mail dans vos courriers
      indésirables. Sinon veuillez demander l’envoi d’un nouvel e-mail à l’aide
      du bouton ci-dessous.
    </p>
    <button
      ref="resendEmailButtonRef"
      class="fr-btn fr-btn--tertiary-no-outline fr-mb-2w"
      @click="resendEmail"
    >
      Demander l’envoi d’un nouvel e-mail
    </button>
    <div aria-live="polite" role="alert">
      <div
        v-if="showResendAlert"
        ref="confirmAlert"
        tabindex="-1"
        class="fr-alert fr-alert--success fr-alert--sm fr-mb-3v"
      >
        <p>Un nouvel e-mail vient de vous être envoyé</p>
        <button
          class="fr-link--close fr-link"
          @click="hideResendAlert"
        ></button>
      </div>
    </div>
    <h2 class="fr-text--sm fr-mb-1w">L’adresse e-mail saisie est erronée ?</h2>
    <button class="fr-btn fr-btn--tertiary-no-outline" @click="updateEmail">
      Modifier mon adresse e-mail
    </button>
  </div>

  <form v-else class="wrapper" @submit.prevent="resetPassword">
    <h1 class="fr-h3">Réinitialiser votre mot de passe</h1>
    <p class="fr-mb-2w">
      Veuillez saisir l’adresse e-mail associée à votre compte. Vous recevrez un
      e-mail pour réinitialiser votre mot de passe.
    </p>

    <div class="fr-input-group">
      <label class="fr-label" for="reset-password-email">
        Adresse e-mail
        <span class="fr-hint-text">Format attendu : nom@domaine.fr</span>
      </label>
      <input
        id="reset-password-email"
        ref="emailFieldRef"
        v-model="email"
        class="fr-input"
        type="email"
        required
      />
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
        <button type="submit" class="fr-btn">Valider</button>
      </li>
    </ul>
  </form>
</template>

<style scoped>
.wrapper {
  max-width: 25rem;
  margin: 0 auto;
}

.instructions-wrapper {
  max-width: 37rem;
  margin: 0 auto;
}
</style>
