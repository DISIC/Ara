<script setup lang="ts">
import { ref, watch } from "vue";
import { onBeforeRouteLeave } from "vue-router";

import EmailSent from "../../components/account/new-acccount/EmailSent.vue";
import NewAccountForm from "../../components/account/new-acccount/NewAccountForm.vue";
import Success from "../../components/account/new-acccount/Success.vue";
import PageMeta from "../../components/PageMeta";
import { useAccountStore } from "../../store/account";

const currentStep = ref(0);
const userEmail = ref<string>();

const pageTitles = [
  "Créer votre compte",
  "Créer votre compte, consulter votre boite de réception",
  "Créer votre compte, votre compte a été créé avec succès"
];

const store = useAccountStore();

const ac = new AbortController();

async function handleSubmit({ username }: { username: string }) {
  userEmail.value = username;
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
  <PageMeta :title="pageTitles[currentStep]" />
  <NewAccountForm v-if="currentStep === 0" @submit="handleSubmit" />
  <EmailSent
    v-else-if="currentStep === 1"
    :user-email="userEmail!"
    @back="currentStep = 0"
  />
  <Success v-else-if="currentStep === 2" :user-email="userEmail!" />
</template>
