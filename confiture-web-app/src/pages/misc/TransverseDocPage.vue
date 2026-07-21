<script setup lang="ts">
import captureEcran from "../../assets/images/capture-bouton-lister-elements-transverses.png";
import PageMeta from "../../components/PageMeta";
import TopLink from "../../components/ui/TopLink.vue";
</script>

<template>
  <PageMeta
    title="Mentions légales"
    description="Mentions légales du site ara.numerique.gouv.fr"
  />

  <section class="fr-my-0 fr-mx-auto content">
    <h1>Onglet «&nbsp;Éléments transverses&nbsp;»</h1>

    <p>L’onglet «&nbsp;Éléments transverses&nbsp;» permet de relever une seule
      fois les non-conformités concernant des éléments présents sur plusieurs
      pages.
      <strong>Son utilisation est optionnelle et ne dispense pas
        d’évaluer chaque critère sur l’ensemble des pages de l’échantillon.</strong>
    </p>
    <nav class="fr-summary fr-mb-4w" role="navigation" aria-labelledby="fr-summary-title">
      <h2 id="fr-summary-title" class="fr-summary__title">Sommaire</h2>
      <ol>
        <li>
          <a id="summary-link-1" class="fr-summary__link" href="#anchor-1">C’est quoi un élément transverse&#8239;?</a>
        </li>
        <li>
          <a id="summary-link-2" class="fr-summary__link" href="#anchor-2">Comment fonctionne l’onglet&#8239;?</a>
        </li>
        <li>
          <a id="summary-link-2" class="fr-summary__link" href="#anchor-2">Pourquoi cet onglet est optionnel&#8239;?</a>
        </li>
        <li>
          <a id="summary-link-2" class="fr-summary__link" href="#anchor-2">Comment ça compte dans le calcul du taux&#8239;?</a>
        </li>
      </ol>
    </nav>

    <h2>C’est quoi un élément transverse&#8239;?</h2>
    <p>Un élément transverses est un élément présent sur
      <strong>plusieurs</strong> ou sur <strong>l’ensemble des pages</strong> de
      l’échantillon. Il peut s’agir par exemple&nbsp;:</p>
    <ul>
      <li>De l’en-tête</li>
      <li>Du pied de page</li>
      <li>Du menu principal</li>
      <li>De la fenêtre de gestion des cookies</li>
    </ul>
    <p>L’auditeurice est <strong>libre de choisir</strong> les éléments considérés comme
      transverses lors de son audit.</p>
    <p>Dans l’onglet «&nbsp;Éléments transverses&nbsp;», cliquez sur le bouton
      «&nbsp;Lister les éléments transverses&nbsp;» situé en haut de l’onglet
      pour afficher le champ permettant de saisir ces éléments.</p>
    <figure role="group" class="fr-content-media" aria-label="Description / Source">
      <div class="fr-content-media__img">
        <img width="459" height="168" :src="captureEcran" alt="" />
      </div>
      <figcaption class="fr-content-media__caption">Page «&nbsp;Audit&nbsp;», onglet «&nbsp;Éléments transverses&nbsp;»</figcaption>
    </figure>
    <h2>Comment fonctionne l’onglet&#8239;?</h2>
    <p>Lorsqu’un élément commun à plusieurs pages présente une non-conformité,
      l’onglet <b>«&nbsp;Éléments transverses&nbsp;»</b> permet de renseigner le
      critère concerné <strong>une seule fois</strong>. Il n’est donc
      <strong>pas nécessaire de répéter</strong> cette même non-conformité sur
      chaque page de l’échantillon où l’élément apparaît.</p>
    <p>Par exemple, une non-conformité liée au menu de navigation principal peut
      être relevée dans l’onglet
      <b>«&nbsp;Éléments transverses&nbsp;»</b>. Si une page présente une autre
      non-conformité liée au même critère dans son contenu, celle-ci doit être
      relevée sur l’onglet de la page concernée.</p>
    <h2>Pourquoi c’est optionnel de le remplir&#8239;?</h2>
    <p>L’utilisation de cet onglet est optionnelle pour plusieurs raisons&nbsp;:</p>
    <ul>
      <li>Cet onglet concerne <strong>uniquement les critères liés aux éléments
        transverses</strong>. Il n’est donc pas nécessaire de renseigner
        l’ensemble des critères</li>
      <li>Vous n’identifiez <strong>aucun élément transverse</strong> au cours
        de votre audit</li>
      <li>Vous pouvez <strong>choisir de ne pas l’utiliser</strong> et de
        renseigner les non-conformités communes à plusieurs pages d’une autre
        façon. Par exemple, directement sur chacune des pages concernées.</li>
    </ul>
    <h2>Comment ça compte dans le calcul du taux&#8239;?</h2>
    <p>Les résultats de cet onglet sont bien pris en compte dans le calcul du
      taux global de conformité.</p>
    <p>Par exemple, si un critère est <b>Conforme</b> sur toutes les pages de
      l'échantillon mais <b>Non conforme</b> dans l’onglet
      <b>«&nbsp;Éléments transverses&nbsp;»</b>, il sera considéré comme
      <b>Non conforme</b> dans le calcul du taux global.</p>
    <div class="top-link">
      <TopLink />
    </div>
  </section>
</template>

<style scoped>
img {
  width: 100%;
  height: auto;
}

.content {
  max-width: 49.5rem;
}

.content p + ul {
  margin-top: 0.75rem;
}

.content ul {
  margin: var(--text-spacing);
}

.top-link {
  text-align: end;
}
</style>
