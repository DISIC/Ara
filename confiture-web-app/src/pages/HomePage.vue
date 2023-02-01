<script setup lang="ts">
import { nextTick, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import { history } from "../router";
import PageMeta from "../components/PageMeta";
import AuditIllustationUrl from "../assets/images/audit-illustration.svg";

const router = useRouter();

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

const steps = [
  {
    title: "1. Paramétrer l’audit",
    description:
      "Vous saisissez le type d’audit, l’échantillon des pages à auditer et une adresse électronique.",
    icon: "⚙️",
  },
  {
    title: "2. Auditer le service",
    description:
      "Vous évaluez la conformité des critères sur l’ensemble des pages de l’échantillon et validez l’audit.",
    icon: "🔎",
  },
  {
    title: "3. Rédiger la déclaration d’accessibilité",
    description:
      "Une fois l’audit complet terminé, le rapport est prêt. Il reste à générer la déclaration.",
    icon: "📃",
  },
];
</script>

<template>
  <PageMeta
    title="Ara - Réaliser des audits d’accessibilité"
    description="Ara est l’outil qui vous permet de réaliser, simplement et rapidement, des audits d'accessibilité numérique."
  />

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
    <div class="fr-grid-row fr-mt-9w">
      <div class="fr-col fr-mb-0">
        <h1 ref="headingRef">
          L’outil qui va simplifier vos audits d’accessibilité numérique
        </h1>
        <p class="fr-text--lg fr-text--bold">
          Démarrez en quelques clics l’audit de votre service !
        </p>
        <p class="fr-text--lg">
          Ara nécessite une bonne connaissance de la méthode technique du
          <abbr
            title="référentiel général d'amélioration de
          l'accessibilité"
            >RGAA</abbr
          >. Ce n’est pas un outil d’audit automatique.
        </p>
        <p>
          Basé sur la dernière version du référentiel général d'amélioration de
          l'accessibilité (RGAA 4.1) vous pouvez&nbsp;:
        </p>
        <ul>
          <li>Commencer par un audit rapide (25 critères)</li>
          <li>Poursuivre par un audit complémentaire (50 critères)</li>
          <li>Faire un audit complet, dit de conformité (106 critères)</li>
          <li>
            Générer votre rapport d’audit et votre déclaration d’accessibilité
          </li>
        </ul>

        <RouterLink
          :to="{ name: 'new-audit-step-one' }"
          class="fr-btn fr-mt-5w fr-mb-7w"
        >
          Je démarre un audit
        </RouterLink>
      </div>
      <div class="fr-displayed-lg">
        <img :src="AuditIllustationUrl" alt="" />
      </div>
    </div>

    <h2 class="fr-h5">Quelles étapes m'attendent ?</h2>
    <div class="fr-grid-row fr-grid-row--gutters">
      <div v-for="step in steps" :key="step.title" class="fr-col">
        <div class="fr-tile fr-tile--horizontal">
          <div class="fr-tile__body step-content">
            <div class="step-icon" aria-hidden="true">{{ step.icon }}</div>
            <h3 class="fr-tile__title">
              {{ step.title }}
            </h3>
            <p class="fr-tile__desc">{{ step.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.steps {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1.5rem;
}

.step-content {
  display: grid;
  grid-template-columns: min-content 1fr;
  grid-template-rows: auto auto;
  column-gap: 2.25rem;
}

.step-icon {
  font-size: 2.5rem;
  grid-row: 1 / -1;
  line-height: 1.5;
}
</style>
