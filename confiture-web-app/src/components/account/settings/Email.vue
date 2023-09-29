<script lang="ts" setup>
import { nextTick, ref } from "vue";

import { useAccountStore } from "../../../store/account";
import { HTTPError } from "ky";
import { useNotifications } from "../../../composables/useNotifications";
import { captureWithPayloads } from "../../../utils";
import { history } from "../../../router";
import DsfrField from "../../DsfrField.vue";

// TODO: cancel email update (what if user clicks on verification email after?)

const accountStore = useAccountStore();
const notify = useNotifications();

// Form submission
const passwordFieldRef = ref<HTMLInputElement>();
const newEmailFieldRef = ref<HTMLInputElement>();
const confirmAlert = ref<HTMLDivElement>();

// Field errors
const passwordError = ref("");
const newEmailError = ref("");

// Field values
const password = ref("");
const newEmail = ref("");

const displayPendingEmailVerification = ref(false);
const displayEmailUpdateSuccess = ref(!!history.state.updatedEmail);

async function showPending() {
  displayPendingEmailVerification.value = true;
  await nextTick();
  confirmAlert.value?.focus();
}

async function hidePending() {
  displayPendingEmailVerification.value = false;
  await nextTick();
  passwordFieldRef.value?.focus();
}

const ac = new AbortController();

async function updateEmail() {
  passwordError.value = "";
  newEmailError.value = "";

  accountStore
    .updateEmail(newEmail.value, password.value)
    .then(showPending)
    .then(() =>
      accountStore
        .waitForEmailUpdateVerification(newEmail.value, ac.signal)
        .then(() => {
          displayPendingEmailVerification.value = false;
          displayEmailUpdateSuccess.value = true;
          displayUpdateEmailForm.value = false;
          accountStore.refreshToken();
        })
        .catch(() => {
          /* Cancelled */
        })
    )
    .catch(async (e) => {
      if (e instanceof HTTPError && e.response.status === 401) {
        passwordError.value = "Le mot de passe saisi est incorrect.";
        await nextTick();
        passwordFieldRef.value?.focus();
      } else if (e instanceof HTTPError && e.response.status === 409) {
        newEmailError.value =
          "Un compte est déjà associé à cette adresse e-mail. Veuillez choisir une autre adresse e-mail.";
        await nextTick();
        newEmailFieldRef.value?.focus();
      } else {
        notify(
          "error",
          "Impossible de mettre à jour l'adresse mail.",
          "Une erreur inconnue empêche la mise à jour de votre compte. Contactez-nous à l'adresse ara@design.numerique.gouv.fr si le problème persiste."
        );
        // TODO: censor password in sentry payload
        captureWithPayloads(e, false);
      }
    });
}

// Send new email
const resendButtonRef = ref<HTMLButtonElement>();
const displayResendAlert = ref(false);

async function hideResendAlert() {
  displayResendAlert.value = false;
  await nextTick();
  resendButtonRef.value?.focus();
}

async function sendNewEmail() {
  await accountStore.resendEmailUpdateVerificationEmail();
  displayResendAlert.value = true;
}

// Toggle display
const showButtonRef = ref<HTMLButtonElement>();
const displayUpdateEmailForm = ref(false);

async function showUpdateEmailForm() {
  displayUpdateEmailForm.value = true;
  await nextTick();
  passwordFieldRef.value?.focus();
}

async function hideUpdateEmailForm() {
  displayUpdateEmailForm.value = false;
  await nextTick();
  showButtonRef.value?.focus();
}

// Show email in report
const showEmailInReport = ref(false);
</script>

<template>
  <h2 class="fr-h6">Adresse e-mail</h2>
  <p>
    Votre adresse email : <strong>{{ accountStore.account?.email }}</strong>
  </p>

  <div
    v-if="displayEmailUpdateSuccess"
    class="fr-alert fr-alert--success fr-mb-3v"
  >
    <p>Votre adresse e-mail a été mise à jour avec succès.</p>
  </div>

  <div v-if="displayPendingEmailVerification">
    <div
      ref="confirmAlert"
      tabindex="-1"
      class="fr-alert fr-alert--info fr-mb-3v"
    >
      <p>
        Un lien pour confirmer votre nouvelle adresse e-mail vient de vous être
        envoyé à l’adresse suivante : <strong>{{ newEmail }}</strong>
      </p>
    </div>

    <h3 class="fr-text--sm fr-mb-1w">Aucun e-mail reçu ?</h3>
    <p class="fr-mb-1w">
      Pensez à vérifier que vous n’avez pas reçu l’e-mail dans vos courriers
      indésirables. Sinon veuillez demander l’envoi d’un nouvel e-mail à l’aide
      du bouton ci-dessous.
    </p>
    <button
      ref="resendButtonRef"
      class="fr-btn fr-btn--tertiary-no-outline"
      :class="{ 'fr-mb-1w': displayResendAlert }"
      @click="sendNewEmail"
    >
      Demander l’envoi d’un nouvel e-mail
    </button>
    <div aria-live="polite">
      <div
        v-if="displayResendAlert"
        class="fr-alert fr-alert--success fr-alert--sm"
      >
        <p>Un nouvel e-mail vient de vous être envoyé</p>
        <button class="fr-link--close fr-link" @click="hideResendAlert">
          Masquer le message
        </button>
      </div>
    </div>

    <h3 class="fr-text--sm fr-mb-1w fr-mt-3v">
      L’adresse e-mail saisie est erronée ?
    </h3>
    <button class="fr-btn fr-btn--tertiary-no-outline" @click="hidePending">
      Modifier mon adresse e-mail
    </button>
  </div>

  <form
    v-if="displayUpdateEmailForm && !displayPendingEmailVerification"
    class="wrapper"
    @submit.prevent="updateEmail"
  >
    <div
      class="fr-password"
      :class="{ 'fr-input-group--error': passwordError }"
    >
      <label class="fr-label" for="password">Mot de passe</label>
      <div class="fr-input-wrap">
        <input
          id="password"
          ref="passwordFieldRef"
          v-model="password"
          class="fr-password__input fr-input"
          :class="{ 'fr-input--error': passwordError }"
          :aria-describedby="passwordError ? 'password-error' : undefined"
          autocomplete="current-password"
          type="password"
          required
        />
      </div>
      <p v-if="passwordError" id="password-error" class="fr-error-text">
        Le mot de passe saisi est incorrect.
      </p>

      <div
        class="fr-password__checkbox fr-checkbox-group fr-checkbox-group--sm"
      >
        <input
          id="toggle-password"
          aria-label="Afficher le mot de passe"
          type="checkbox"
        />
        <label class="fr-password__checkbox fr-label" for="toggle-password">
          Afficher
        </label>
      </div>
      <!-- TODO: uncomment this once the forgot password page is done. -->
      <!-- <p>
        <a href="[À MODIFIER - url de la page de récupération]" class="fr-link"
          >Mot de passe oublié ?</a
        >
      </p> -->

      <DsfrField
        id="new-email"
        v-model="newEmail"
        class="fr-mt-3v"
        label="Nouvelle adresse e-mail"
        hint="Format attendu : nom@domaine.fr"
        type="email"
        required
      />
    </div>
    <ul
      class="fr-btns-group fr-btns-group--inline fr-btns-group--right fr-mt-3w"
    >
      <li>
        <button
          class="fr-btn fr-btn--secondary fr-mb-0"
          @click="hideUpdateEmailForm"
        >
          Annuler
        </button>
      </li>
      <li>
        <button type="submit" class="fr-btn fr-mb-0">
          Changer d’adresse e-mail
        </button>
      </li>
    </ul>
  </form>

  <button
    v-else-if="!displayPendingEmailVerification"
    ref="showButtonRef"
    class="fr-btn fr-btn--tertiary-no-outline fr-mb-2w"
    @click="showUpdateEmailForm"
  >
    Changer d’adresse e-mail
  </button>

  <div class="fr-toggle fr-toggle--label-left">
    <input
      id="show-email-in-report"
      v-model="showEmailInReport"
      type="checkbox"
      class="fr-toggle__input"
      aria-describedby="show-email-in-report-desc"
    />
    <label class="fr-toggle__label" for="show-email-in-report"
      >Afficher l’adresse e-mail dans le rapport d’audit</label
    >
    <p id="show-email-in-report-desc" class="fr-hint-text">
      Permet d’aider le demandeur de l’audit à vous contacter s’il a des
      questions ou besoin d’aide.
    </p>
  </div>
</template>

<style scoped>
.wrapper {
  max-width: 30rem;
}
</style>
