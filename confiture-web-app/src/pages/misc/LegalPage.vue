<script setup lang="ts">
import PageMeta from "../../components/PageMeta";
</script>

<!--
  TODO: missing elements:
  - product name
  - editor info
  - publishing info
  - hosting provider info
  - accessibility info
 -->
<template>
  <PageMeta
    title="Mentions légales"
    description="Mentions légales du site confiture.numerique.gouv.fr"
  />

  <section class="fr-my-0 fr-mx-auto content">
    <h1>Mentions légales de Confiture</h1>
    <nav
      class="fr-summary fr-mb-6w"
      role="navigation"
      aria-labelledby="fr-summary-title"
    >
      <p id="fr-summary-title" class="fr-summary__title">Sommaire</p>
      <ol class="fr-summary__list">
        <!-- <li>
          <a class="fr-summary__link" href="#editeur-plateforme"
            >Éditeur de la Plateforme</a
          >
        </li> -->
        <!-- <li>
          <a class="fr-summary__link" href="#directeur-publication"
            >Directeur de la publication</a
          >
        </li> -->
        <!-- <li>
          <a class="fr-summary__link" href="#hebergement-plateforme"
            >Hébergement de la Plateforme</a
          >
        </li> -->
        <li>
          <a class="fr-summary__link" href="#accessibilite">Accessibilité</a>
        </li>
        <li>
          <a class="fr-summary__link" href="#signaler-dysfonctionnement"
            >Signaler un dysfonctionnement</a
          >
        </li>
        <li>
          <a class="fr-summary__link" href="#en-savoir-plus">En savoir plus</a>
        </li>
        <li>
          <a class="fr-summary__link" href="#securite">Sécurité</a>
        </li>
      </ol>
    </nav>

    <!-- <h2 id="editeur-plateforme">Éditeur de la Plateforme</h2>
    <p class="fr-mb-6w">
      La Plateforme [Nom du Produit] est éditée par [Nom de l’éditeur] situé :
      [Adresse éditeur] [Téléphone éditeur] [Mail éditeur]
    </p> -->

    <!-- <h2 id="directeur-publication">Directeur de la publication</h2>
    <p class="fr-mb-6w">[Nom du Directeur de la publication]</p> -->

    <!-- <h2 id="hebergement-plateforme">Hébergement de la Plateforme</h2>
    <p class="fr-mb-6w">
      Ce site est hébergé en propre par [Hébergeur] : [Adresse de l’hébergeur]
    </p> -->

    <h2 id="accessibilite">Accessibilité</h2>
    <p class="fr-mb-6w">
      La conformité aux normes d’accessibilité numérique est un objectif
      ultérieur mais nous tâchons de rendre ce site accessible à toutes et à
      tous.
    </p>

    <h2 id="signaler-dysfonctionnement">Signaler un dysfonctionnement</h2>
    <p class="fr-mb-6w">
      Si vous rencontrez un défaut d’accessibilité vous empêchant d’accéder à un
      contenu ou une fonctionnalité du site, merci de nous en faire part. Si
      vous n’obtenez pas de réponse rapide de notre part, vous êtes en droit de
      faire parvenir vos doléances ou une demande de saisine au Défenseur des
      droits.
    </p>

    <h2 id="en-savoir-plus">En savoir plus</h2>
    <p class="fr-mb-6w">
      Pour en savoir plus sur la politique d’accessibilité numérique de l’État :
      <a
        class="fr-link"
        href="http://references.modernisation.gouv.fr/accessibilite-numerique"
        target="_blank"
        >http://references.modernisation.gouv.fr/accessibilite-numerique</a
      >
    </p>

    <h2 id="securite">Sécurité</h2>
    <p>
      Le site est protégé par un certificat électronique, matérialisé pour la
      grande majorité des navigateurs par un cadenas. Cette protection participe
      à la confidentialité des échanges. En aucun cas les services associés à la
      plateforme ne seront à l’origine d’envoi de courriels pour demander la
      saisie d’informations personnelles.
    </p>
  </section>
</template>

<style scoped>
.content {
  max-width: 49.5rem;
}
</style>
