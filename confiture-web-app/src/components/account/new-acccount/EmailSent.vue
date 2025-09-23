<script lang="ts" setup>
import { ref } from "vue";

import { useAccountStore } from "../../../store/account";

const props = defineProps<{ userEmail: string }>();

defineEmits(["back"]);

const authStore = useAccountStore();

const resendEmailButton = ref<HTMLButtonElement>();
const showResendSuccessAlert = ref(false);

async function resendEmail() {
  await authStore.resendVerificationEmail(props.userEmail);
  showResendSuccessAlert.value = true;
}

async function closeResendSuccessAlert() {
  resendEmailButton.value?.focus();
  showResendSuccessAlert.value = false;
}
</script>

<template>
  <div class="wrapper">
    <h1 tabindex="-1" class="fr-h3">Consultez votre boite de réception</h1>
    <p class="fr-mb-6w">
      Un lien pour confirmer votre adresse e-mail vient de vous être envoyé à l’adresse :<br /><strong>{{ userEmail }}</strong>
    </p>

    <h2 class="fr-text--md fr-mb-1w">Aucun e-mail reçu ?</h2>

    <ul class="fr-text--sm">
      <li>Vérifiez votre dossier « courrier indésirable » (spams).</li>
      <li>Sinon, demandez l’envoi d'un nouvel e-mail en cliquant sur le bouton ci-dessous :</li>
    </ul>

    <button
      class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline fr-mb-2w"
      @click="resendEmail"
    >
      Demander l’envoi d’un nouvel e-mail
    </button>

    <div
      v-if="showResendSuccessAlert"
      class="fr-alert fr-alert--sm fr-alert--success fr-mb-2w"
    >
      <p>Un nouvel e-mail vient de vous être envoyé</p>
      <button
        class="fr-btn--close fr-btn"
        title="Masquer le message"
        @click="closeResendSuccessAlert"
      >Masquer le message
      </button>
    </div>

    <h2 class="fr-text--md fr-mb-1w">
      L’adresse e-mail saisie est erronée ?
    </h2>
    <button
      class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline"
      @click="$emit('back')"
    >
      Modifier mon adresse e-mail
    </button>
  </div>
</template>

<style scoped>
.wrapper {
  max-width: 49.5rem;
  margin: 0 auto;
}
</style>
