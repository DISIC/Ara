<script lang="ts" setup>
import { nextTick, ref } from "vue";

import PageMeta from "../../components/PageMeta";
import { useAccountStore } from "../../store/account";

const accountStore = useAccountStore();

const headingRef = ref<HTMLHeadingElement>();
const feedback = ref("");
const showSuccess = ref(false);
const showSuccessAlert = ref(true);

function submitFeedback() {
  accountStore.sendAccountDeletionFeedback(feedback.value).then(() => {
    showSuccess.value = true;
  });
}

async function closeSuccessAlert() {
  showSuccessAlert.value = false;
  await nextTick();
  headingRef.value?.focus();
}
</script>
<template>
  <PageMeta title="Compte supprimé avec succès" />

  <!-- Alert -->
  <div v-if="showSuccessAlert" class="fr-alert fr-alert--success fr-mb-4w">
    <h3 class="fr-alert__title">Vous avez été déconnecté et votre compte a été supprimé avec succès</h3>
    <p>
      Toutes les données liées à votre compte ont été supprimées. Votre nom et
      prénom ainsi que votre adresse e-mail n’apparaissent plus sur les audits
      et rapports d’audit que vous avez créés.
    </p>
    <button
      class="fr-btn--close fr-btn"
      title="Masquer le message"
      @click="closeSuccessAlert"
    >
      Masquer le message
    </button>
  </div>

  <div aria-live="polite" aria-atomic="true" role="alert" class="wrapper">
    <template v-if="showSuccess">
      <p class="fr-h3 success-title">
        <span
          class="success-icon fr-icon--lg fr-icon-checkbox-circle-fill fr-mr-1w"
          aria-hidden="true"
        ></span>
        Votre avis a bien été envoyé
      </p>
      <p>
        Nous vous remercions pour le temps que vous avez pris, tous les avis
        partagés seront étudiés.
      </p>
      <div>
        <RouterLink
          class="fr-link fr-icon-arrow-right-line fr-link--icon-right"
          :to="{ name: 'home' }"
        >
          Aller à la page d’accueil
        </RouterLink>
      </div>
    </template>
  </div>

  <div v-if="!showSuccess" class="wrapper">
    <h1 ref="headingRef" tabindex="-1" class="fr-h2">
      Ara ne sera plus le même sans vous 😔
    </h1>

    <form @submit.prevent="submitFeedback">
      <div class="fr-input-group">
        <label class="fr-label" for="feedback">
          Pourriez-vous nous donner la raison de votre départ ?
        </label>
        <textarea
          id="feedback"
          v-model="feedback"
          rows="5"
          class="fr-input"
          required
        ></textarea>
      </div>
      <button type="submit" class="fr-btn">Envoyer mon avis</button>
    </form>

    <div class="fr-mt-6w">
      <RouterLink
        class="fr-link fr-icon-arrow-right-line fr-link--icon-right"
        :to="{ name: 'home' }"
      >
        Aller à la page d’accueil
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  max-width: 37.5rem;
  margin: 0 auto;
}

.success-title {
  display: flex;
  align-items: center;
}

.success-icon {
  color: var(--text-default-success);
}
</style>
