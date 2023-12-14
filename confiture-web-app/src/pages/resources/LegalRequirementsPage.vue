<script setup lang="ts">
import TopLink from "../../components/ui/TopLink.vue";
import PageMeta from "../../components/PageMeta";
</script>

<template>
  <PageMeta
    title="Obligations légales et sanctions"
    description="Les obligations d’accessibilité des sites publics aux personnes en situation de handicap ont été introduites par l’article 47 de la loi du 11 février 2005."
  />

  <section class="fr-my-0 content">
    <h1 class="fr-mt-6w fr-mb-9v">Obligations légales et sanctions</h1>
    <h2>Introduction</h2>
    <p>
      Les obligations d’accessibilité des sites publics aux personnes en
      situation de handicap ont été introduites par l’<strong
        >article 47 de la loi du 11 février 2005</strong
      >. Ces obligations ont été précisées par le décret du 14 mai 2009
      prévoyant un délai de 2 ans pour les services de l’État et de 3 ans pour
      les collectivités territoriales.
    </p>

    <p>
      Depuis 2012, <strong>tous les sites publics</strong> qu’ils appartiennent
      aux services de l’État ou aux collectivités territoriales
      <strong>sont soumis à l’obligation d’accessibilité</strong>.
    </p>

    <p class="fr-mb-6w">
      De plus, depuis le 23 septembre 2019, les sites publics doivent
      <strong
        >publier une déclaration d’accessibilité et afficher leur
        conformité</strong
      >
      dès la page d’accueil.
    </p>

    <h2>Vos obligations</h2>
    <p>
      L’obligation d’accessibilité s’étend aux sites intranet, extranet, ainsi
      qu’aux applications mobiles, progiciels et mobiliers urbains numériques
      (ex : les distributeurs de titres de transport).
    </p>

    <h3>Pour chaque site ou service, vous devez :</h3>
    <ul class="fr-mb-3w">
      <li>
        Publier en ligne une
        <RouterLink class="fr-link" :to="{ name: 'accessibility-statement' }"
          >déclaration d’accessibilité</RouterLink
        >
        indiquant l’état d’accessibilité du site ou service.
      </li>

      <li>
        Afficher sur toutes les pages
        <strong>le taux de conformité au RGAA</strong> du site ou service :
        <ul>
          <li>
            « <strong>Accessibilité : totalement conforme</strong> » si le taux
            est égal à 100% (bravo !)
          </li>
          <li>
            « <strong>Accessibilité : partiellement conforme</strong> » si le
            taux est supérieur à 50%
          </li>
          <li>
            « <strong>Accessibilité : non conforme</strong> » si le taux est
            inférieur à 50% ou inconnu
            <p>
              Cette mention peut être cliquable et conduire vers la page
              Accessibilité ou vers la déclaration d’accessibilité.
            </p>
          </li>
        </ul>
      </li>
      <li>
        Permettre aux usagers de faire part de leurs difficultés, et de saisir
        le Défenseur des droits en cas de non-réponse du responsable du site.
      </li>
    </ul>

    <h3>Pour votre entité vous devez :</h3>
    <ul class="fr-mb-6w">
      <li>
        Produire et publier un schéma pluriannuel de mise en accessibilité sur 3
        ans, décliné en plan annuel détaillant les actions prévues pour évoluer
        vers une accessibilité complète.
      </li>
      <li>
        Consulter le décret n° 2019-768 du 24 juillet 2019 relatif à
        l'accessibilité aux personnes handicapées des services de communication
        au public en ligne.
      </li>
    </ul>

    <h2>Calendrier</h2>
    <ul class="fr-mb-6w">
      <li>
        Tous les sites du secteur public doivent être accessibles depuis le 23
        septembre 2020
      </li>
      <li>
        23 juin 2021 : toutes les applications mobiles, les progiciels et les
        mobiliers urbains numériques doivent être accessibles.
      </li>
    </ul>

    <h2>Sanctions</h2>
    <p>
      Le manquement à ces obligations déclaratives peut entraîner une sanction
      financière prononcée par le ministre chargé des personnes handicapées d’un
      montant de 20 000 euros par service en ligne.
    </p>
    <p class="fr-mb-6w">
      La Direction générale de la cohésion sociale est chargée de vérifier le
      respect des obligations et de proposer les sanctions à prononcer Ministre
      chargé des affaires sociales.
    </p>

    <h2>Transposition de la directive européenne</h2>
    <p>
      La norme européenne pour l'accès aux produits et services TIC (EN-301549)
      a été mise à jour en 2018 pour inclure les nouveaux critères
      internationaux sur l'accessibilité (WCAG 2.1), à travers la directive
      européenne 2016/2102 relative à l'accessibilité des sites internet et des
      applications mobiles des organismes du secteur public.
    </p>

    <p>
      La transposition de cette directive (2016/2102) européenne a été achevée
      par :
    </p>
    <ol>
      <li>
        La modification de l’article 47 de la loi du 11 février 2005 par
        l’article 80 de la loi n° 2018-771
      </li>
      <li>
        La publication du décret n° 2019-768 du 24 juillet 2019 relatif à
        l'accessibilité des services de communication au public en ligne aux
        personnes handicapées
      </li>
      <li>
        La publication de l’arrêté du 20 septembre 2019 mettant en vigueur et
        approuvant la version 4.0 du Référentiel général de l’amélioration de
        l’accessibilité (RGAA).
      </li>
    </ol>

    <TopLink />
  </section>
</template>

<style scoped>
.content {
  max-width: 49.5rem;
}
</style>
