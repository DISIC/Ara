<script setup lang="ts">
import AfterReport from "../../components/FaqAccordionsContent/AfterReport.vue";
import Prioritize from "../../components/FaqAccordionsContent/Prioritize.vue";
import Test from "../../components/FaqAccordionsContent/Test.vue";
import AfterCorrection from "../../components/FaqAccordionsContent/AfterCorrection.vue";
import FullyAccessible from "../../components/FaqAccordionsContent/FullyAccessible.vue";
import PageMeta from "../../components/PageMeta";

const tileLinks = [
  {
    title: "Formations accessibilité",
    description: "Me former ou former mon équipe",
    routeName: "accessibility-training",
  },
  {
    title: "Outils",
    description: "Aide à la mise en œuvre des tests",
    routeName: "tools",
  },
  {
    title: "Glossaire",
    description: "Définitions de tous les termes du RGAA",
    routeName: "glossary",
  },
  {
    title: "Réaliser un audit accessibilité",
    description: "Tout savoir pour réaliser un audit",
    routeName: "make-a11y-audit",
  },
];

const moreLinks = [
  {
    title: "DesignGouv",
    description:
      "les ressources de DesignGouv, le pôle design des services numériques de la Dinum.",
    href: "https://design.numerique.gouv.fr/",
  },
  {
    title: "RGAA",
    description:
      "les obligations légales, la méthode technique et tout ce qu’il faut savoir sur le RGAA.",
    href: "https://accessibilite.numerique.gouv.fr/",
  },
  {
    title: "DSFR",
    description:
      "le site officiel du Système de Design de l’État développé par le SIG",
    href: "https://www.systeme-de-design.gouv.fr/",
  },
  {
    title: "Jeu de l’OAA",
    description:
      "le jeu qui vous guidera dans la mise en accessibilité de votre service numérique",
    href: "https://design.numerique.gouv.fr/accessibilite-numerique/jeu-de-oaa/",
  },
];

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
    title: "Comment être conforme à 100% ?",
    component: FullyAccessible,
  },
];
</script>

<template>
  <PageMeta
    title="Ressources"
    description="Retrouvez les formations de l'équipe Design des services numériques, les outils et le glossaire vous permettant de réaliser sereinement votre audit d'accessibilité numérique."
  />

  <h1 class="fr-mt-6w">Ressources</h1>

  <section class="fr-my-0 content">
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

  <section class="fr-my-0 content">
    <h2 class="fr-mt-6w">Ressources</h2>

    <p>
      Retrouvez une sélection de ressources et d’outils pour vous aider à vous
      préparer et à mener votre chantier accessibilité&nbsp;:
    </p>
    <div class="fr-grid-row fr-grid-row--gutters fr-mb-7w">
      <div
        v-for="link in tileLinks"
        :key="link.routeName"
        class="fr-col-12 fr-col-md-6"
      >
        <div class="fr-tile fr-enlarge-link fr-tile--horizontal">
          <div class="fr-tile__body">
            <h3 class="fr-tile__title">
              <RouterLink
                class="fr-tile__link"
                :to="{ name: link.routeName }"
                >{{ link.title }}</RouterLink
              >
            </h3>
            <p class="fr-tile__desc">{{ link.description }}.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="content">
    <h2>Aller plus loin</h2>
    <p>
      Vous souhaitez plus de ressources ou en savoir davantage sur les bonnes
      pratiques liées à l’accessibilité numérique ?
    </p>

    <ul>
      <li v-for="link in moreLinks" :key="link.href">
        <a
          class="fr-link"
          :href="link.href"
          rel="noreferrer noopener"
          target="_blank"
        >
          {{ link.title }} <span class="sr-only">(nouvelle fenêtre)</span>
        </a>
        : {{ link.description }}.
      </li>
    </ul>
  </section>
</template>

<style scoped>
.content {
  max-width: 49.5rem;
}
</style>
