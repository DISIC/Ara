<script setup lang="ts">
import { nextTick, onMounted, ref } from "vue";
import { useRouter, createWebHistory } from "vue-router";

const router = useRouter();
const history = createWebHistory();

const isDeleteAlertVisible = ref(false);
const headingRef = ref();
const closeAlertRef = ref();

// Display alert and focus its close button
onMounted(async () => {
  if (history.state.deleteAudit) {
    isDeleteAlertVisible.value = true;
    await nextTick();
    closeAlertRef.value.focus();
  }
});

// Hide alert, remove query param and focus main title
async function hideDeleteAlert() {
  isDeleteAlertVisible.value = false;
  router.push({ query: {} });
  await nextTick();
  headingRef.value.focus();
}
</script>

<template>
  <div
    v-if="isDeleteAlertVisible"
    role="alert"
    class="fr-alert fr-alert--success fr-mb-4w"
  >
    <p>L’audit a correctement été supprimé.</p>
    <button
      ref="closeAlertRef"
      class="fr-btn--close fr-btn"
      @click="hideDeleteAlert"
    >
      Masquer le message
    </button>
  </div>

  <section>
    <h1 ref="headingRef" tabindex="0">Audit d’accessibilité numérique</h1>
    <p>
      Avant de démarrer un nouvel audit vous passerez par 2 étapes afin de
      saisir :
    </p>
    <ul>
      <li>Les information générales du site à auditer</li>
      <li>Les informations générales de l’audit lui-même</li>
    </ul>
    <p class="fr-mb-4w">
      ⏱️ Ces 2 étapes vous prendront environ 15 min. Vous pourrez ensuite faire
      votre audit.
    </p>

    <RouterLink :to="{ name: 'new-audit-step-one' }" class="fr-btn">
      Je démarre un audit
    </RouterLink>
  </section>
</template>
