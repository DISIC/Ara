<script lang="ts" setup>
import { HTTPError } from "ky";
import { nextTick, ref } from "vue";
import { onBeforeRouteLeave } from "vue-router";

import { useNotifications } from "../../../composables/useNotifications";
import {
  EMAIL,
  REQUIRED,
  useFormField,
  validate
} from "../../../composables/validation";
import { history } from "../../../router";
import { useAccountStore } from "../../../store/account";
import { captureWithPayloads, formatEmail } from "../../../utils";
import DsfrField from "../../ui/DsfrField.vue";
import DsfrPassword from "../../ui/DsfrPassword.vue";

const accountStore = useAccountStore();
const notify = useNotifications();

const confirmAlert = ref<HTMLDivElement>();

const password = useFormField("" as string, [
  REQUIRED("Champ obligatoire. Saisissez votre mot de passe.")
]);
const newEmail = useFormField("" as string, [
  REQUIRED("Champ obligatoire. Saisissez votre nouvelle adresse e-mail."),
  EMAIL("Format incorrect. Utilisez le format : nom@domaine.fr.")
]);

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
  password.focusRef.value?.focus();
}

const ac = ref<AbortController>();

async function updateEmail() {
  if (!validate(password, newEmail)) {
    // Invalid form
    return;
  }

  accountStore
    .updateEmail(formatEmail(newEmail.value.value), password.value.value)
    .then(showPending)
    .then(() => {
      ac.value = new AbortController();
      return accountStore
        .waitForEmailUpdateVerification(newEmail.value.value, ac.value.signal)
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
        password.error.value = "Le mot de passe saisi est incorrect.";
        await nextTick();
        password.focusRef.value?.focus();
      } else if (e instanceof HTTPError && e.response.status === 409) {
        newEmail.error.value =
          "La nouvelle adresse e-mail saisie est identique à celle utilisée pour votre compte. Veuillez choisir une autre adresse e-mail.";
        await nextTick();
        newEmail.focusRef.value?.focus();
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
  password.focusRef.value?.focus();
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
    password.value.value = "";
    newEmail.value.value = "";
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
    <p>Votre adresse e-mail a été mise à jour avec succès.</p>
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
        envoyé à l’adresse suivante : <strong>{{ newEmail.value }}</strong>
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
  <form
    v-if="displayUpdateEmailForm && !displayPendingEmailVerification"
    class="wrapper"
    novalidate
    @submit.prevent="updateEmail"
  >
    <DsfrPassword
      id="email-password"
      :ref="password.refFn"
      :model-value="password.value.value"
      :error="password.error.value"
      class="fr-mb-3w"
      label="Mot de passe"
      required
      autocomplete="current-password"
      show-forgotten-password-link
      skip-forgotten-password-first-step
      @update:model-value="password.value.value = $event"
    />

    <DsfrField
      id="new-email"
      :ref="newEmail.refFn"
      :model-value="newEmail.value.value"
      :error="newEmail.error.value"
      class="fr-mt-3v"
      label="Nouvelle adresse e-mail"
      hint="Format attendu : nom@domaine.fr"
      type="email"
      required
      @update:model-value="newEmail.value.value = $event"
    />

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
</template>

<style scoped>
.wrapper {
  max-width: 30rem;
}
</style>
