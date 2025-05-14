<script setup lang="ts">
import jwtDecode from "jwt-decode";
import { HTTPError } from "ky";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import PageMeta from "../../components/PageMeta";
import { useNotifications } from "../../composables/useNotifications";
import router from "../../router";
import { useAccountStore } from "../../store/account";
import { NewEmailVerificationJwtPayload } from "../../types";

const route = useRoute();
const store = useAccountStore();
const tokenIsInvalid = ref(false);
const showSuccess = ref(false);
const newEmail = ref<string>();

const notify = useNotifications();

onMounted(async () => {
  const verificationToken = route.query.token;

  if (typeof verificationToken !== "string") {
    tokenIsInvalid.value = true;
    return;
  }

  newEmail.value = (
    jwtDecode(verificationToken) as NewEmailVerificationJwtPayload
  ).email;

  store
    .verifyEmailUpdate(verificationToken)
    .then(async () => {
      if (store.account) {
        await store.refreshToken();

        router.push({
          name: "account-settings",
          state: { updatedEmail: true }
        });
      } else {
        showSuccess.value = true;
      }
    })
    .catch((err) => {
      if (err instanceof HTTPError && err.response.status === 401) {
        tokenIsInvalid.value = true;
      } else {
        console.log(err);
        notify(
          "error",
          "Échec de la validation de l'adresse mail.",
          "Une erreur inconnue est survenue"
        );
      }
    });
});
</script>

<template>
  <PageMeta title="Mettre à jour l’adresse e-mail" />
  <!-- Failure page -->
  <template v-if="tokenIsInvalid">
    <div class="wrapper">
      <div class="fr-mb-3w title">
        <h1 class="fr-h1 fr-m-0">Désolé, votre lien n’est plus valide</h1>
      </div>

      <p class="fr-text--xl">
        Votre lien de vérification a expiré. Veuillez recommencer la procédure
        de changement d'adresse email.
      </p>

      <p class="fr-text--sm fr-mb-6w">
        Si vous avez besoin d’une aide pour la création de votre compte, merci
        de nous contacter par e-mail à l’adresse suivante :
        <strong>ara@design.numerique.gouv.fr</strong>.
      </p>

      <RouterLink
        :to="{ name: 'account-settings' }"
        class="fr-link fr-icon-arrow-right-line fr-link--icon-right"
      >
        Accéder aux paramètres de mon compte
      </RouterLink>
    </div>
  </template>

  <!-- Sucess page shown when user is not connected -->
  <template v-if="showSuccess">
    <div class="wrapper">
      <div class="fr-mb-3w title">
        <h1 class="fr-h3 fr-m-0">
          <span
            class="success-icon fr-icon--lg fr-icon-checkbox-circle-fill"
            aria-hidden="true"
          ></span>
          Votre adresse e-mail a été mise à jour avec succès
        </h1>
      </div>

      <p class="fr-mb-6w">
        La prochaine fois que vous vous connectez à votre compte, assurez-vous
        que vous utilisez l’adresse e-mail :
        <strong>{{ newEmail }}</strong
        >.
      </p>

      <RouterLink
        :to="{ name: 'login' }"
        class="fr-link fr-icon-arrow-right-line fr-link--icon-right"
      >
        Aller à la page de connexion
      </RouterLink>
    </div>
  </template>
</template>

<style scoped>
.wrapper {
  max-width: 49.5rem;
  margin: 0 auto;
}

.title {
  display: flex;
  align-items: center;
}

.success-icon {
  color: var(--text-default-success);
}
</style>
