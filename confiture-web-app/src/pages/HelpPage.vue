<script setup lang="ts">
const tileLinks = [
  {
    title: "Obligations légales",
    description: "Soyez rassuré une bonne fois pour toutes",
    href: "/aide/obligations-legales",
  },
  {
    title: "RGAA",
    description: "Kesako ? Tout savoir sur le RGAA",
    href: "/aide/rgaa",
  },
  {
    title: "Déclaration d’a11é",
    description: "À quoi ça sert ? Comment ça marche ?",
    href: "/aide/declaration-accessibilite",
  },
  {
    title: "Schéma pluriannuel",
    description: "À quoi ça sert ? Comment ça marche ?",
    href: "/aide/schema-pluriannuel",
  },
];

const accordions = [
  {
    title: "Comment me former ou former mon équipe ?",
    description:
      "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Reiciendis, neque. Ex, perferendis fugit obcaecati dicta incidunt corrupti cumque officiis esse sed, quia nesciunt ullam illo nemo ea necessitatibus, vel magni?",
  },
  {
    title: "Que faire après avoir reçu mon rapport ?",
    description:
      "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Reiciendis, neque. Ex, perferendis fugit obcaecati dicta incidunt corrupti cumque officiis esse sed, quia nesciunt ullam illo nemo ea necessitatibus, vel magni?",
  },
  {
    title: "Comment prioriser les correctifs ?",
    description:
      "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Reiciendis, neque. Ex, perferendis fugit obcaecati dicta incidunt corrupti cumque officiis esse sed, quia nesciunt ullam illo nemo ea necessitatibus, vel magni?",
  },
  {
    title: "Comment faire remonter rapidement le taux d’accessibilité ? ",
    description:
      "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Reiciendis, neque. Ex, perferendis fugit obcaecati dicta incidunt corrupti cumque officiis esse sed, quia nesciunt ullam illo nemo ea necessitatibus, vel magni?",
  },
  {
    title: "Comment être accessible à 100% ?",
    description:
      "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Reiciendis, neque. Ex, perferendis fugit obcaecati dicta incidunt corrupti cumque officiis esse sed, quia nesciunt ullam illo nemo ea necessitatibus, vel magni?",
  },
  {
    title: "Comment tester mes correctifs ?",
    description:
      "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Reiciendis, neque. Ex, perferendis fugit obcaecati dicta incidunt corrupti cumque officiis esse sed, quia nesciunt ullam illo nemo ea necessitatibus, vel magni?",
  },
  {
    title:
      "Que faire après avoir corrigé les anomalies et testé les corrections ?",
    description:
      "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Reiciendis, neque. Ex, perferendis fugit obcaecati dicta incidunt corrupti cumque officiis esse sed, quia nesciunt ullam illo nemo ea necessitatibus, vel magni?",
  },
  {
    title: "Comment réaliser soi-même un audit accessibilité ? ",
    description:
      "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Reiciendis, neque. Ex, perferendis fugit obcaecati dicta incidunt corrupti cumque officiis esse sed, quia nesciunt ullam illo nemo ea necessitatibus, vel magni?",
  },
  {
    title: "Quelles sont mes obligations légales ?",
    description:
      "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Reiciendis, neque. Ex, perferendis fugit obcaecati dicta incidunt corrupti cumque officiis esse sed, quia nesciunt ullam illo nemo ea necessitatibus, vel magni?",
  },
];
</script>

<template>
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
            <!-- TODO: fill correct description -->
            <p>{{ accordion.description }}</p>
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
                src="https://picsum.photos/id/94/200/200"
                class="fr-responsive-img"
                alt=""
              />
            </div>
          </div>
        </div>
      </div>

      <h3>Aller plus loin</h3>
      <p>Retrouver plus d’information les sites officiels :</p>

      <ul class="fr-mb-7w">
        <li>
          <a
            class="fr-link"
            href="https://design.numerique.gouv.fr/"
            target="_blank"
            >DesignGouv</a
          >
        </li>
        <li>
          <a
            class="fr-link"
            href="https://accessibilite.numerique.gouv.fr/"
            target="_blank"
            >RGAA (RGAA.Netify.app)</a
          >
        </li>
      </ul>
    </section>
    <section class="fr-mb-10v">
      <h2>Toujours pas de réponse à votre problème ?</h2>
      <p>
        Vous pouvez contacter l’auditeur qui a réalisé cet audit en utilisant
        l’adresse e-mail
        <strong>prenom.nom@prestataire.modernisation.gouv.fr</strong>.
      </p>
    </section>
    <a class="fr-link fr-icon-arrow-up-fill fr-link--icon-left" href="#header"
      >Haut de page</a
    >
  </div>
</template>

<style scoped>
.content {
  max-width: 49.5rem;
}
</style>
