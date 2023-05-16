<script setup lang="ts">
import { ref, watch } from "vue";
import { useAccountStore } from "../../store/account";
import NewAccountForm from "../../components/account/new-acccount/NewAccountForm.vue";
import EmailSent from "../../components/account/new-acccount/EmailSent.vue";
import Success from "../../components/account/new-acccount/Success.vue";
import { onBeforeRouteLeave } from "vue-router";

/*
TODO:
- validation côté client
- affichage des erreurs (validation côté client et erreurs serveur)
- gestion du focus
- email
- last step ("Votre compte a été créé avec succès")
*/

const currentStep = ref(0);
const userEmail = ref<string>();

const store = useAccountStore();

const ac = new AbortController();

async function handleSubmit({
  username,
  password,
}: {
  username: string;
  password: string;
}) {
  userEmail.value = username;
  await store.createAccount(username, password);
  currentStep.value = 1;

  store
    .waitForVerification(userEmail.value, ac.signal)
    .then(() => {
      currentStep.value = 2;
    })
    .catch(() => {
      // wait cancelled
    });
}

watch(currentStep, (currentStep) => {
  document.querySelector("h1")?.focus();

  if (currentStep !== 1) {
    ac.abort();
  }
});

onBeforeRouteLeave(() => {
  ac.abort();
});
</script>

<template>
  <NewAccountForm v-if="currentStep === 0" @submit="handleSubmit" />
  <EmailSent
    v-else-if="currentStep === 1"
    :user-email="userEmail!"
    @back="currentStep = 0"
  />
  <Success v-else-if="currentStep === 2" :user-email="userEmail!" />
</template>
