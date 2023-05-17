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
    .verifyAccountCreation(verificationToken)
    .then(() => {
      const { email } = jwtDecode(
        verificationToken
      ) as AccountVerificationJwtPayload;
      router.push({ name: "login", state: { email } });
    })
    .catch((err) => {
      if (err instanceof HTTPError && err.response.status === 401) {
        tokenIsInvalid.value = true;
      } else {
        notify(
          "error",
          "Echéc de la vérification du compte",
          "Une erreur inconnue est survenue"
        );
      }
    });
});
</script>

<template>
  <!-- TODO: Invalid token error message -->
  <p v-if="tokenIsInvalid">Gaaaaah ça marche pô :'(</p>

  <!-- TODO: Loading -->
  <p v-else>Validation en cours...</p>
</template>
