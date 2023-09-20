<script setup lang="ts">
import jwtDecode from "jwt-decode";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import router from "../../router";
import { useAccountStore } from "../../store/account";
import { AccountVerificationJwtPayload } from "../../types";
import { HTTPError } from "ky";
import { useNotifications } from "../../composables/useNotifications";

const route = useRoute();
const store = useAccountStore();
const tokenIsInvalid = ref(false);

const notify = useNotifications();

onMounted(async () => {
  const verificationToken = route.query.token;

  if (typeof verificationToken !== "string") {
    tokenIsInvalid.value = true;
    return;
  }

  store
    .verifyEmailUpdate(verificationToken)
    .then(async () => {
      if (store.account) {
        await store.refreshToken();

        router.push({
          name: "account-settings",
          state: { updatedEmail: true },
        });
      } else {
        // TODO: when user is not connected
        // router.push({ name: "email-update-successful" })
      }
    })
    .catch((err) => {
      if (err instanceof HTTPError && err.response.status === 401) {
        tokenIsInvalid.value = true;
      } else {
        console.log(err);
        notify(
          "error",
          "Echéc de la validation de l'adresse mail.",
          "Une erreur inconnue est survenue"
        );
      }
    });
});
</script>

<template>
  <template v-if="tokenIsInvalid">
    <div class="wrapper">
      <div class="fr-mb-3w title">
        <h1 class="fr-h1 fr-m-0">Désolé, votre lien n’est plus valide</h1>
      </div>

      <p class="fr-text--xl">
        Votre lien de vérification a expiré. POUET POUET
      </p>

      <p class="fr-text--sm fr-mb-6w">
        Si vous avez besoin d’une aide pour la création de votre compte, merci
        de nous contacter par e-mail à l’adresse suivante :
        <strong>ara@design.numerique.gouv.fr</strong>.
      </p>

      <RouterLink
        :to="{ name: 'new-account' }"
        class="fr-link fr-icon-arrow-right-line fr-link--icon-right"
      >
        Créer un compte sur Ara
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
</style>
