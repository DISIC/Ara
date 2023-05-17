<script setup lang="ts">
import jwtDecode from "jwt-decode";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import router from "../../router";
import { useAccountStore } from "../../store/account";
import { AccountVerificationJwtPayload } from "../../types";

const route = useRoute();
const store = useAccountStore();
const tokenIsInvalid = ref(false);

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
      // TODO: check status is 401
      tokenIsInvalid.value = true;
    });
});
</script>

<template>
  <!-- TODO: Loading -->
  <p>Validation en cours...</p>

  <!-- TODO: Invalid token error message -->
  <p v-if="tokenIsInvalid">Gaaaaah ça marche pô :'(</p>
</template>
