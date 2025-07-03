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
    <h1 tabindex="-1" class="fr-h3">Consulter votre boite de réception</h1>
    <p class="fr-mb-6w">
      Un mail contenant un lien pour vérifier votre e-mail vient de vous être
      envoyé à l’adresse : <strong>{{ userEmail }}</strong>
    </p>

    <p class="fr-mb-1w"><strong>Aucun e-mail reçu ?</strong></p>
    <p class="fr-text--sm">
      Pensez à vérifier que vous n’avez pas reçu le mail dans vos courriers
      indésirable. Sinon veuillez demander l’envoi d’un nouveau mail à l’aide du
      bouton ci-dessous.
    </p>
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

    <p class="fr-mb-1w">
      <strong>L’adresse e-mail saisie est erronée ?</strong>
    </p>
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
  max-width: 37.5rem;
  margin: 0 auto;
}
</style>
