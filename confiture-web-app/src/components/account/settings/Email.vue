<script lang="ts" setup>
import { HTTPError } from "ky";
import { nextTick, ref, useTemplateRef } from "vue";
import { onBeforeRouteLeave } from "vue-router";

import { useNotifications } from "../../../composables/useNotifications";
import { EMAIL, REQUIRED } from "../../../composables/validation";
import { history } from "../../../router";
import { useAccountStore } from "../../../store/account";
import { captureWithPayloads, formatEmail } from "../../../utils";
import DsfrFieldWithValidation from "../../validation/DsfrFieldWithValidation.vue";
import DsfrPasswordWithValidation from "../../validation/DsfrPasswordWithValidation.vue";
import FormWithValidation from "../../validation/form-with-validation/FormWithValidation.vue";

const accountStore = useAccountStore();
const notify = useNotifications();

const confirmAlert = ref<HTMLDivElement>();

const password = ref("");
const newEmail = ref("");

const passwordField = useTemplateRef("password-field");
const newEmailField = useTemplateRef("new-email-field");

const displayPendingEmailVerification = ref(false);

const displayEmailUpdateSuccess = ref(!!history.state.updatedEmail);

async function closeEmailUpdateSuccess() {
  displayEmailUpdateSuccess.value = false;
  await nextTick();
  showButtonRef.value?.focus();
}

async function showPending() {
  displayPendingEmailVerification.value = true;
  await nextTick();
  confirmAlert.value?.focus();
}

async function hidePending() {
  displayPendingEmailVerification.value = false;
  ac.value?.abort();
  await nextTick();
  passwordField.value?.focus();
}

const ac = ref<AbortController>();

async function updateEmail() {
  accountStore
    .updateEmail(formatEmail(newEmail.value), password.value)
    .then(showPending)
    .then(() => {
      ac.value = new AbortController();
      return accountStore
        .waitForEmailUpdateVerification(newEmail.value, ac.value.signal)
        .then(() => {
          displayPendingEmailVerification.value = false;
          displayEmailUpdateSuccess.value = true;
          displayUpdateEmailForm.value = false;
          accountStore.refreshToken();
        })
        .catch(() => {
          /* Cancelled */
        });
    })
    .catch(async (e) => {
      if (e instanceof HTTPError && e.response.status === 401) {
        passwordField.value?.setError("Le mot de passe saisi est incorrect.", true);
      } else if (e instanceof HTTPError && e.response.status === 409) {
        newEmailField.value?.setError("La nouvelle adresse e-mail saisie est identique à celle utilisée pour votre compte. Veuillez choisir une autre adresse e-mail.", true);
      } else {
        notify(
          "error",
          "Impossible de mettre à jour l'adresse mail.",
          "Une erreur inconnue empêche la mise à jour de votre compte. Contactez-nous à l'adresse ara@design.numerique.gouv.fr si le problème persiste."
        );
        captureWithPayloads(e, false);
      }
    });
}

onBeforeRouteLeave(() => {
  ac.value?.abort();
});

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
  newEmailField.value?.focus();
}

async function hideUpdateEmailForm() {
  displayUpdateEmailForm.value = false;
  await nextTick();
  showButtonRef.value?.focus();
}

// Cancel email update
async function cancelEmailUpdate() {
  try {
    await accountStore.cancelEmailUpdate();
  } catch (e) {
    notify(
      "error",
      "Impossible d’annuler le changement d’adresse e-mail.",
      "Une erreur inconnue empêche l’annulation du changement d’adresse e-mail. Contactez-nous à l'adresse ara@design.numerique.gouv.fr si le problème persiste."
    );
    captureWithPayloads(e, false);
  } finally {
    displayPendingEmailVerification.value = false;
    displayUpdateEmailForm.value = false;
    password.value = "";
    newEmail.value = "";
    await nextTick();
    showButtonRef.value?.focus();
  }
}
</script>

<template>
  <h2 class="fr-h6">Adresse e-mail</h2>
  <p>
    Votre adresse email : <strong>{{ accountStore.account?.email }}</strong>
  </p>

  <!-- Success alert -->
  <div
    v-if="displayEmailUpdateSuccess"
    class="fr-alert fr-alert--success fr-mb-3v"
  >
    <p>Votre adresse e-mail a été mise à jour</p>
    <button class="fr-link--close fr-link" @click="closeEmailUpdateSuccess">
      Masquer le message
    </button>
  </div>

  <!-- Instructions -->
  <div v-if="displayPendingEmailVerification" class="fr-mb-2w">
    <div
      ref="confirmAlert"
      tabindex="-1"
      class="fr-alert fr-alert--info fr-mb-3v"
    >
      <p>
        Un lien pour confirmer votre nouvelle adresse e-mail vient de vous être
        envoyé à l’adresse suivante : <strong>{{ newEmail }}</strong>
      </p>
    </div>

    <h3 class="fr-text--sm fr-mb-1w">Aucun e-mail reçu ?</h3>
    <p class="fr-text--sm fr-mb-1w">
      Pensez à vérifier que vous n’avez pas reçu l’e-mail dans vos courriers
      indésirables. Sinon veuillez demander l’envoi d’un nouvel e-mail à l’aide
      du bouton ci-dessous.
    </p>
    <button
      ref="resendButtonRef"
      class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline"
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
      L’adresse e-mail saisie est erronée ?
    </h3>
    <button
      class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline"
      @click="hidePending"
    >
      Modifier mon adresse e-mail
    </button>

    <div class="fr-mt-3w">
      <button class="fr-btn fr-btn--secondary" @click="cancelEmailUpdate">
        Annuler le changement d’adresse e-mail
      </button>
    </div>
  </div>

  <!-- Update email form -->
  <FormWithValidation
    v-if="displayUpdateEmailForm && !displayPendingEmailVerification"
    class="wrapper"
    @submit="updateEmail"
  >

    <DsfrFieldWithValidation
      id="new-email"
      ref="new-email-field"
      v-model="newEmail"
      class="fr-mt-3v"
      label="Nouvelle adresse e-mail"
      hint="Format attendu : nom@domaine.fr"
      type="email"
      required
      :validation="[
        REQUIRED('Champ obligatoire. Saisissez votre nouvelle adresse e-mail.'),
        EMAIL('Format incorrect. Utilisez le format : nom@domaine.fr.')
      ]"
    />

    <DsfrPasswordWithValidation
      id="email-password"
      ref="password-field"
      v-model="password"
      class="fr-mb-3w"
      label="Mot de passe"
      required
      autocomplete="current-password"
      show-forgotten-password-link
      skip-forgotten-password-first-step
      :validation="[REQUIRED('Champ obligatoire. Saisissez votre mot de passe.')]"
    />

    <ul
      class="fr-btns-group fr-btns-group--inline fr-btns-group--right fr-mt-3w"
    >
      <li>
        <button
          class="fr-btn fr-btn--secondary fr-mb-0"
          type="button"
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
  </FormWithValidation>

  <button
    v-else-if="!displayPendingEmailVerification"
    ref="showButtonRef"
    class="fr-btn fr-btn--tertiary-no-outline"
    @click="showUpdateEmailForm"
  >
    Changer d’adresse e-mail
  </button>
</template>

<style scoped>
.wrapper {
  max-width: 30rem;
}
</style>
