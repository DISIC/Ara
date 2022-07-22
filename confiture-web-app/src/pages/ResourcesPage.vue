<script setup lang="ts">
const tileLinks = [
  {
    title: "Formations accessibilité",
    description: "Me former ou former mon équipe",
    href: "/ressources/formations-accessibilite",
  },
  {
    title: "Outils",
    description: "Aide à la mise en oeuvre des correctifs et des tests",
    href: "/ressources/outils",
  },
  {
    title: "Glossaire",
    description: "Définitions de tous les termes du RGAA",
    href: "/ressources/glossaire",
  },
];

const moreLinks = [
  {
    title: "DesignGouv",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    href: "https://design.numerique.gouv.fr/",
  },
  {
    title: "RGAA",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    href: "https://accessibilite.numerique.gouv.fr/",
  },
  {
    title: "Design-accessible.fr",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    href: "https://design-accessible.fr/",
  },
  {
    title: "DSFR",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    href: "https://www.systeme-de-design.gouv.fr/",
  },
  {
    title: "Jeu de l’OAA",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    href: "https://design.numerique.gouv.fr/accessibilite-numerique/jeu-de-oaa/",
  },
];
</script>

<template>
  <section class="fr-my-0 content">
    <h1 class="fr-mt-6w">Ressources</h1>
    <p>
      Retrouvez une selection de ressources et d’outils pour vous aider à vous
      préparer et à mener votre chantier accessibilité.
    </p>
    <div class="fr-grid-row fr-grid-row--gutters fr-mb-7w">
      <div
        v-for="link in tileLinks"
        :key="link.href"
        class="fr-col-12 fr-col-md-6"
      >
        <div class="fr-tile fr-enlarge-link fr-tile--horizontal">
          <div class="fr-tile__body">
            <h3 class="fr-tile__title">
              <RouterLink class="fr-tile__link" :to="link.href">{{
                link.title
              }}</RouterLink>
            </h3>
            <p class="fr-tile__desc">{{ link.description }}</p>
          </div>
          <div class="fr-tile__img">
            <!-- TODO: replace img src -->
            <img
              src="https://picsum.photos/id/20/200/200"
              class="fr-responsive-img"
              alt=""
            />
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="content">
    <h2>Aller plus loin</h2>
    <p>
      Vous souhaitez plus de ressources ou en savoir plus sur les bonnes
      pratiques liées à l’accessibilité numérique ?
    </p>

    <ul>
      <li v-for="link in moreLinks" :key="link.href">
        {{ link.description }}
        <a class="fr-link" :href="link.href" target="_blank">{{
          link.title
        }}</a>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.content {
  max-width: 49.5rem;
}
</style>
