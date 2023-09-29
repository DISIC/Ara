<script lang="ts" setup>
import { nextTick, ref } from "vue";

import ResetPasswordForm from "../../components/account/password-reset/ResetPasswordForm.vue";
import ResetInstructions from "../../components/account/password-reset/ResetInstructions.vue";
import RequestPasswordReset from "../../components/account/password-reset/RequestPasswordReset.vue";

import { useAccountStore } from "../../store/account";
import { captureWithPayloads } from "../../utils";
import { useNotifications } from "../../composables/useNotifications";

// TODO: condition to show form? param in reset email link?
const currentStep = ref(0);
const store = useAccountStore();
const notify = useNotifications();

const resetInstructionsRef = ref<InstanceType<typeof ResetInstructions>>();
const requestPasswordResetRef =
  ref<InstanceType<typeof RequestPasswordReset>>();

const accountEmail = ref<string>();

async function onRequestSubmit(email: string) {
  try {
    await store.requestPasswordReset(email);
    accountEmail.value = email;
    currentStep.value = 1;
    await nextTick();
    resetInstructionsRef.value?.focusHeading();
  } catch (e) {
    notify(
      "error",
      "Impossible de demander la réinitialisation du mot de passe",
      "Une erreur inconnue empêche la réinitialisation de votre mot de passe. Contactez-nous à l'adresse ara@design.numerique.gouv.fr si le problème persiste."
    );
    captureWithPayloads(e, false);
  }
}

function resendEmail() {
  console.log("resend email");
}

async function updateEmail() {
  currentStep.value = 0;
  await nextTick();
  requestPasswordResetRef.value?.focusEmailField();
}
</script>

<template>
  <RequestPasswordReset
    v-if="currentStep === 0"
    ref="requestPasswordResetRef"
    @submit="onRequestSubmit"
  />
  <ResetInstructions
    v-if="currentStep === 1"
    ref="resetInstructionsRef"
    :email="accountEmail!"
    @resend-email="resendEmail"
    @update-email="updateEmail"
  />
  <!-- <ResetPasswordForm v-if="showPasswordResetForm" /> -->
</template>
