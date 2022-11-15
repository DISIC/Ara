<script setup lang="ts">
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
      "notre site officiel dédié au design et à l’accessibilité des services numériques",
    href: "https://design.numerique.gouv.fr/",
  },
  {
    title: "RGAA",
    description:
      "enjeux, tests, obligations légales, méthodes, tout le RGAA en plus clair",
    href: "https://accessibilite.numerique.gouv.fr/",
  },
  {
    title: "DSFR",
    description: "le site officiel du Système de Design de l’État",
    href: "https://www.systeme-de-design.gouv.fr/",
  },
  {
    title: "Jeu de l’OAA",
    description:
      "le jeu qui vous guidera dans la mise en accessibilité de votre service numérique",
    href: "https://design.numerique.gouv.fr/accessibilite-numerique/jeu-de-oaa/",
  },
];
</script>

<template>
  <PageMeta
    title="Ressources"
    description="Retrouvez les formations de l'équipe Design des services numériques, les outils et le glossaire vous permettant de réaliser sereinement votre audit d'accessibilité numérique."
  />

  <section class="fr-my-0 content">
    <h1 class="fr-mt-6w">Ressources</h1>
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
          :title="link.title + ' - nouvelle fenêtre'"
          rel="noreferrer noopener"
          target="_blank"
        >
          {{ link.title }}
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
