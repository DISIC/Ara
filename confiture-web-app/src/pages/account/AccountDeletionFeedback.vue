<script lang="ts" setup>
import { ref } from "vue";

import greenCheck from "../../assets/images/green-check.svg";
import PageMeta from "../../components/PageMeta";
import { useAccountStore } from "../../store/account";

const accountStore = useAccountStore();

const feedback = ref("");
const showSuccess = ref(false);

function submitFeedback() {
  accountStore.sendAccountDeletionFeedback(feedback.value).then(() => {
    showSuccess.value = true;
  });
}
</script>
<template>
  <PageMeta title="Compte supprimé avec succès" />
  <div aria-live="polite" aria-atomic="true" role="alert">
    <template v-if="showSuccess">
      <p class="fr-h3 success-title">
        <img class="fr-mr-2w" :src="greenCheck" alt="" />
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

  <template v-if="!showSuccess">
    <div class="fr-alert fr-alert--success fr-mb-4w">
      <h3 class="fr-alert__title">Votre compte a été supprimé avec succès</h3>
      <p>
        Toutes les données liées à votre compte ont été supprimées. Votre nom et
        prénom ainsi que votre adresse e-mail n’apparaissent plus sur les audits
        et rapports d’audit que vous avez créés.
      </p>
    </div>

    <div class="wrapper">
      <h1 class="fr-h2">Ara ne sera plus le même sans vous 😔</h1>

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
</style>
