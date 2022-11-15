<script setup lang="ts">
import AfterReport from "../../components/FaqAccordionsContent/AfterReport.vue";
import Prioritize from "../../components/FaqAccordionsContent/Prioritize.vue";
import Test from "../../components/FaqAccordionsContent/Test.vue";
import AfterCorrection from "../../components/FaqAccordionsContent/AfterCorrection.vue";
import QuickWin from "../../components/FaqAccordionsContent/QuickWin.vue";
import FullyAccessible from "../../components/FaqAccordionsContent/FullyAccessible.vue";
import SelfAuditing from "../../components/FaqAccordionsContent/SelfAuditing.vue";
import LegalRequirements from "../../components/FaqAccordionsContent/LegalRequirements.vue";
import TeamTraining from "../../components/FaqAccordionsContent/TeamTraining.vue";
import TopLink from "../../components/TopLink.vue";
import PageMeta from "../../components/PageMeta";

const accordions = [
  {
    title: "Que faire après avoir reçu mon rapport ?",
    component: AfterReport,
  },
  {
    title: "Comment prioriser les correctifs ?",
    component: Prioritize,
  },
  {
    title: "Comment tester mes correctifs ?",
    component: Test,
  },
  {
    title:
      "Que faire après avoir corrigé les anomalies et testé les corrections ?",
    component: AfterCorrection,
  },
  {
    title: "Comment faire remonter rapidement le taux d’accessibilité ? ",
    component: QuickWin,
  },
  {
    title: "Comment être conforme à 100% ?",
    component: FullyAccessible,
  },
  {
    title: "Comment réaliser soi-même un audit accessibilité ? ",
    component: SelfAuditing,
  },
  {
    title: "Quelles sont les obligations légales ?",
    component: LegalRequirements,
  },
  {
    title: "Comment me former ou former mon équipe ?",
    component: TeamTraining,
  },
];

const tileLinks = [
  {
    title: "Les obligations légales",
    routeName: "legal-requirements",
  },
  {
    title: "Le RGAA",
    routeName: "rgaa",
  },
  {
    title: "La déclaration d’accessibilité",
    routeName: "accessibility-statement",
  },
  {
    title: "Le schéma pluriannuel",
    routeName: "accessibility-plan",
  },
];

const moreLinks = [
  {
    title: "DesignGouv",
    description:
      "notre site dédié au design et à l’accessibilité des services numériques",
    href: "https://design.numerique.gouv.fr/",
  },
  {
    title: "RGAA",
    description:
      "enjeux, tests, obligations légales, méthodes, tout le RGAA en plus clair",
    href: "https://accessibilite.numerique.gouv.fr/",
  },
];
</script>

<template>
  <PageMeta
    title="Aide"
    description="Obtenez des réponses à vos questions les plus fréquentes ou contactez l'équipe Design des services numériques."
  />

  <div class="fr-my-0 content">
    <h1>Aide</h1>
    <section>
      <h2>Questions fréquentes</h2>
      <div class="fr-accordions-group fr-mb-6w">
        <section
          v-for="(accordion, i) in accordions"
          :key="accordion.title"
          class="fr-accordion"
        >
          <h3 class="fr-accordion__title">
            <button
              class="fr-accordion__btn"
              aria-expanded="false"
              :aria-controls="`accordion-${i}`"
            >
              {{ accordion.title }}
            </button>
          </h3>
          <div :id="`accordion-${i}`" class="fr-collapse">
            <component :is="accordion.component" />
          </div>
        </section>
      </div>
    </section>
    <section>
      <h2>Comprendre</h2>
      <p>
        Vous débutez dans l’accessibilité numérique ? Vous maitrisez déjà le
        sujet mais une piqure de rappel ne vous ferait pas de mal ?
      </p>

      <div class="fr-grid-row fr-grid-row--gutters fr-mb-7w">
        <div
          v-for="link in tileLinks"
          :key="link.routeName"
          class="fr-col-12 fr-col-md-6"
        >
          <div class="fr-tile fr-enlarge-link fr-tile--horizontal">
            <div class="fr-h3 fr-tile__body">
              <RouterLink
                class="fr-tile__link"
                :to="{ name: link.routeName }"
                >{{ link.title }}</RouterLink
              >
            </div>
          </div>
        </div>
      </div>

      <h2>Aller plus loin</h2>
      <p>Retrouver plus d’informations sur les sites officiels&nbsp;:</p>

      <ul class="fr-mb-7w">
        <li v-for="link in moreLinks" :key="link.title">
          <a
            class="fr-link"
            :href="link.href"
            :title="link.title + ' - nouvelle fenêtre'"
            target="_blank"
          >
            {{ link.title }}
          </a>
          : {{ link.description }}.
        </li>
      </ul>
    </section>
    <TopLink />
  </div>
</template>

<style scoped>
.content {
  max-width: 49.5rem;
}
</style>
