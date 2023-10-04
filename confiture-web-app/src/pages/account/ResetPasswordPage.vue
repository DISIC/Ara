<script lang="ts" setup>
import { computed, nextTick, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import NewPasswordForm from "../../components/account/password-reset/NewPasswordForm.vue";
import ResetInstructions from "../../components/account/password-reset/ResetInstructions.vue";
import RequestPasswordReset from "../../components/account/password-reset/RequestPasswordReset.vue";

import { useAccountStore } from "../../store/account";
import { captureWithPayloads } from "../../utils";
import { useNotifications } from "../../composables/useNotifications";
import jwtDecode from "jwt-decode";
import { PasswordResetVerificationJwtPayload } from "../../types";

const route = useRoute();
const router = useRouter();
const verificationToken = computed(() => route.query.token);
const currentStep = ref(verificationToken.value ? 2 : 0);
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
    captureWithPayloads(e);
  }
}

async function resendEmail() {
  try {
    // the resend button only appears when the email is already known
    await store.requestPasswordReset(accountEmail.value!);
    resetInstructionsRef.value?.displayResendAlert();
  } catch (e) {
    notify(
      "error",
      "Impossible de demander la réinitialisation du mot de passe",
      "Une erreur inconnue empêche la réinitialisation de votre mot de passe. Contactez-nous à l'adresse ara@design.numerique.gouv.fr si le problème persiste."
    );
    captureWithPayloads(e);
  }
}

async function updateEmail() {
  currentStep.value = 0;
  await nextTick();
  requestPasswordResetRef.value?.focusEmailField();
}

async function resetPassword(newPassword: string) {
  try {
    const { email } = jwtDecode(
      verificationToken.value as string
    ) as PasswordResetVerificationJwtPayload;
    await store.resetPassword(newPassword, verificationToken.value as string);

    if (store.account) {
      // User is logged in
      router.push({
        name: "account-dashboard",
        state: { passwordReset: true },
      });
    } else {
      router.push({ name: "login", state: { email, passwordReset: true } });
    }
  } catch (e) {
    notify(
      "error",
      "Impossible de procéder à la mise à jour du mot de passe",
      "Une erreur inconnue empêche la mise à jour du mot de passe. Contactez-nous à l'adresse ara@design.numerique.gouv.fr si le problème persiste."
    );
    captureWithPayloads(e, false);
  }
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
  <NewPasswordForm v-if="currentStep === 2" @submit="resetPassword" />
</template>
