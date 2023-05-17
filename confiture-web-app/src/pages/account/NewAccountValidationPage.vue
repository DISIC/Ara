<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import jwt_decode from "jwt-decode";

import { useAccountStore } from "../../store/account";
import router from "../../router";
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
      const payload = jwt_decode(
        verificationToken
      ) as AccountVerificationJwtPayload;

      router.push({ name: "login", state: { email: payload.sub } });
    })
    .catch((err) => {
      tokenIsInvalid.value = true;
    });
});
</script>

<template>
  <p>Validation en cours...</p>

  <p v-if="tokenIsInvalid">Gaaaaah ça marche pô :'(</p>
</template>
