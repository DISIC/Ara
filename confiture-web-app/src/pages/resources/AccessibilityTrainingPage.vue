<script setup lang="ts">
import TopLink from "../../components/TopLink.vue";
import PageMeta from "../../components/PageMeta";
</script>

<template>
  <PageMeta
    title="Formations accessibilité"
    description="Retrouvez en vidéo les formations de l'équipe Design des services numériques pour réaliser."
  />
  <section class="fr-my-0">
    <h1 class="fr-mt-6w">Formations accessibilité</h1>
    <h2>Nos formations</h2>
    <div class="fr-grid-row fr-grid-row--gutters fr-mb-3w">
      <div class="fr-col fr-col-12 fr-col-md-6">
        <div class="fr-card fr-enlarge-link">
          <div class="fr-card__body">
            <div class="fr-card__content">
              <h3 class="fr-card__title">
                <RouterLink :to="{ name: 'a11y-intro-training' }">
                  Introduction à l’accessibilité numérique
                </RouterLink>
              </h3>
              <p class="fr-card__desc">
                Pourquoi et comment bien prendre en compte les personnes en
                situation de handicap dans la conception de services publics
                numériques
              </p>
              <div class="fr-card__end">
                <p class="fr-card__detail">Webinaire</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="fr-col fr-col-12 fr-col-md-6">
        <div class="fr-card fr-enlarge-link">
          <div class="fr-card__body">
            <div class="fr-card__content">
              <h3 class="fr-card__title">
                <RouterLink :to="{ name: 'public-digital' }">
                  Bien faire du numérique public
                </RouterLink>
              </h3>
              <p class="fr-card__desc">
                Pourquoi et comment designer de bons services publics numériques
                : simples, accessibles à tous et toutes, sobres
              </p>
              <div class="fr-card__end">
                <p class="fr-card__detail">Webinaire</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="content">
      <!-- TODO: hide until newsletter page is created -->
      <!-- <h3>Nos ateliers</h3>
      <p>
        Vous êtes un agent de l’État ? Nous organisons régulièrement des
        ateliers collaboratifs, inscrivez-vous à notre newsletter et soyez
        informé de nos prochains ateliers.
      </p>
      <RouterLink to="#" class="fr-btn fr-btn--secondary fr-mb-6w"
        >Être tenu informé</RouterLink
      > -->
      <h2>Formations d’autres organismes</h2>
      <h3>Initiations</h3>
      <ul class="fr-mb-7v">
        <li>
          <a
            class="fr-link"
            href="https://www.fun-mooc.fr/en/cours/accessibilite-numerique/"
            target="_blank"
            >L’accessibilité numérique</a
          >
          : 13 heures, gratuit.
        </li>
        <li>
          <a
            class="fr-link"
            href="https://fr.wikiversity.org/wiki/Mise_en_%C5%93uvre_de_l_accessibilite_numerique#comprendrelaccessibilite"
            target="_blank"
            >Mise en œuvre de l’accessibilité numérique</a
          >
          : 14 heures, gratuit.
        </li>
        <li>
          Si vous êtes agent de l’État et avez accès à la plateforme Mentor,
          deux parcours sont disponibles :
          <ul>
            <li>
              <a
                class="fr-link"
                href="https://mentor.gouv.fr/local/catalog/pages/training.php?trainingid=314"
                target="_blank"
                >L’accessibilité numérique selon votre métier</a
              >
              : de 1h20 à 8h suivant les modules choisis, gratuit.
            </li>
            <li>
              <a
                class="fr-link"
                href="https://mentor.gouv.fr/local/catalog/pages/training.php?trainingid=262"
                target="_blank"
                >L’essentiel de l’accessibilité de la communication de l’État
              </a>
              : 3h30, gratuit.
            </li>
          </ul>
        </li>
      </ul>

      <h3>Certification</h3>
      <ul>
        <li>
          <a
            class="fr-link"
            href="https://formations.access42.net/certifications/developper-des-sites-web-accessibles/"
            target="_blank"
            >Développer des sites web accessibles</a
          >
          : 9 heures, payant.
        </li>
      </ul>

      <p>
        Si votre organisme propose une formation certifiante et souhaite être
        référencé sur notre site, vous pouvez nous contacter en utilisant
        l’adresse e-mail : <strong>contact@design.numerique.gouv.fr</strong>.
      </p>
    </div>

    <TopLink />
  </section>
</template>

<style scoped>
.content {
  max-width: 49.5rem;
}
</style>
