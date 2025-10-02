<script lang="ts" setup>
import { nextTick, ref } from "vue";

import { useAccountStore } from "../../../store";

defineProps<{ email: string }>();

const emit = defineEmits<{
  (e: "resend-email"): void;
  (e: "update-email"): void;
}>();

const accountStore = useAccountStore();

// Send reset email password
const instructionsHeadingRef = ref<HTMLHeadingElement>();

// Resend email
const resendEmailButtonRef = ref<HTMLButtonElement>();
const showResendAlert = ref(false);

async function resendEmail() {
  emit("resend-email");
}

async function hideResendAlert() {
  showResendAlert.value = false;
  await nextTick();
  resendEmailButtonRef.value?.focus();
}

defineExpose({
  focusHeading: () => {
    instructionsHeadingRef.value?.focus();
  },
  displayResendAlert: () => {
    showResendAlert.value = true;
  }
});
</script>

<template>
  <div class="wrapper">
    <h1 ref="instructionsHeadingRef" class="fr-h3" tabindex="-1">
      Consultez votre boite de réception
    </h1>
    <p class="fr-mb-6w">
      Un lien pour réinitialiser votre mot de passe vient de vous être envoyé par e-mail à l’adresse :<br /><strong>{{ email }}</strong>
    </p>
    <h2 class="fr-text--md fr-mb-1w">Aucun e-mail reçu ?</h2>
    <ul class="fr-text--sm fr-mb-1w">
      <li>Vérifiez votre dossier « courrier indésirable » (spams).</li>
      <li>Sinon, demandez l’envoi d’un nouvel e-mail.</li>
    </ul>
    <button
      ref="resendEmailButtonRef"
      class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline fr-mb-2w"
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
        <button class="fr-link--close fr-link" @click="hideResendAlert">
          Masquer le message
        </button>
      </div>
    </div>
    <template v-if="!accountStore.account?.email">
      <h2 class="fr-text--md fr-mb-1w">
        L’adresse e-mail saisie est erronée ?
      </h2>
      <button
        class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline"
        @click="$emit('update-email')"
      >
        Modifier mon adresse e-mail
      </button>
    </template>
  </div>
</template>

<style scoped>
.wrapper {
  max-width: 37rem;
  margin: 0 auto;
}
</style>
