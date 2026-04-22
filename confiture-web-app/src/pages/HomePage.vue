<script setup lang="ts">
import { useRouter } from "vue-router";

import DebugCard from "../components/DebugCard.vue";
import PageMeta from "../components/PageMeta";
import { useDevMode } from "../composables/useDevMode";
import { REFERENTIAL } from "../enums";
import { useAccountStore } from "../store";

const router = useRouter();
const isDevMode = useDevMode();

// Redirect connected user to his account
const accountStore = useAccountStore();

if (accountStore.account) {
  router.push({ name: "account-dashboard" });
}

const steps = [
  {
    title: "1. Paramétrer l’audit",
    description:
      "Vous saisissez le type d’audit, l’échantillon des pages à auditer et une adresse électronique.",
    icon: "⚙️"
  },
  {
    title: "2. Auditer le service",
    description:
      "Vous évaluez la conformité des critères sur l’ensemble des pages de l’échantillon et validez l’audit.",
    icon: "🔎"
  },
  {
    title: "3. Rédiger la déclaration d’accessibilité",
    description:
      "Une fois l’audit complet terminé, le rapport est prêt. Il reste à générer la déclaration.",
    icon: "📃"
  }
];
</script>

<template>
  <PageMeta
    title="Accueil"
    description="Avec Ara, vous évaluez manuellement les 106 critères du RGAA, générez un rapport d’audit et une déclaration d’accessibilité"
  />

  <DebugCard v-if="isDevMode" />

  <section class="fr-mt-9w">
    <h1 ref="headingRef">Je réalise un audit d’accessibilité avec Ara</h1>
    <p class="fr-text--lg">
      Ara nécessite une bonne connaissance de la méthode technique du
      <abbr
        title="référentiel général d’amélioration de
          l’accessibilité"
      >RGAA</abbr>.
    </p>
    <p>
      Basé sur la dernière version du référentiel général d’amélioration de
      l’accessibilité ({{ REFERENTIAL }}) vous pouvez&nbsp;:
    </p>
    <ul>
      <li>Faire un état des lieux (audit partiel de 25 ou 50 critères)</li>
      <li>Faire un audit complet, dit de conformité (106 critères)</li>
      <li>
        Générer votre rapport d’audit et votre déclaration d’accessibilité
      </li>
    </ul>

    <div class="cta-with-message fr-mt-5w fr-mb-7w">
      <p class="fr-mb-0">
        <span
          class="fr-icon-information-line fr-mr-1v"
          aria-hidden="true"
        ></span>
        <strong>Ara n’audite pas automatiquement votre site</strong>
      </p>
      <RouterLink :to="{ name: 'create-audit' }" class="fr-btn">
        Je réalise un audit
      </RouterLink>
    </div>

    <h2 class="fr-h5">Quelles étapes m’attendent ?</h2>
    <div class="fr-grid-row fr-grid-row--gutters">
      <div v-for="step in steps" :key="step.title" class="fr-col">
        <div class="fr-p-4w step-wrapper">
          <div class="step-content">
            <div class="step-icon" aria-hidden="true">{{ step.icon }}</div>
            <h3 class="fr-text--md step-title">
              {{ step.title }}
            </h3>
            <p class="fr-mb-0">{{ step.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cta-with-message {
  display: flex;
  flex-direction: column-reverse;
  gap: 0.75rem;
}

.steps {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1.5rem;
}

.step-wrapper {
  border: 1px solid var(--border-default-grey);
  height: 100%;
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
