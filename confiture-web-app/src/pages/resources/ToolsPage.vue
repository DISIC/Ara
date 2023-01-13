<script setup lang="ts">
import TopLink from "../../components/TopLink.vue";
import PageMeta from "../../components/PageMeta";
</script>

<template>
  <PageMeta
    title="Les outils pour estimer l'accessibilité numérique"
    description="Découvrez les outils pour auditer des produits et services numériques."
  />

  <section class="fr-my-0 content">
    <h1 class="fr-mt-6w">Outils</h1>
    <h2>Introduction</h2>
    <p>
      L’outil le plus utile reste l’inspecteur de code que propose chaque
      navigateur. Il permet de rechercher facilement les éléments et les
      attributs requis pour un examen par un test d’accessibilité.
    </p>
    <p>
      Les aides techniques listées dans l’<a
        class="fr-link"
        href="https://accessibilite.numerique.gouv.fr/methode/environnement-de-test/"
        target="_blank"
        >environnement de test
        <span class="sr-only">(nouvelle fenêtre)</span></a
      >
      constituent un second ensemble d’outils indispensables; ils sont, en
      effet, requis pour s’assurer d’une restitution correcte de contenus
      accessibles (les alternatives aux images, les intitulés de lien, les
      titres de tableau, ...) dans le cas notamment où l’examen du code seul ne
      suffirait pas.
    </p>
    <p class="fr-mb-6w">
      D’autres outils sont disponibles pour aider à la recherche des éléments de
      contenu ; ils se présentent souvent comme des extensions au navigateur et
      permettent d’explorer un ou plusieurs aspects d’un test d’accessibilité.
    </p>
    <h2>Recommandations</h2>
    <h3>Repérage</h3>
    <p>
      Les barres d’outils sont des extensions du navigateur qui vont faciliter
      le repérage visuel de certains éléments dans un document :
    </p>
    <ul>
      <li>
        <a
          class="fr-link"
          href="https://addons.mozilla.org/fr/firefox/addon/web-developer/"
          target="_blank"
          >Web Developer Toolbar pour Firefox
          <span class="sr-only">(nouvelle fenêtre)</span></a
        >
        : barre d’outils pour les développeurs qui peut aider à retrouver
        visuellement certains éléments dans un document pour en contrôler
        l’accessibilité.
      </li>
      <li>
        <a
          class="fr-link"
          href="https://chrome.google.com/webstore/detail/web-developer/bfbameneiokkgbdmiekhjnmfkcnldhhm"
          target="_blank"
          >Web Developer Toolbar pour Chrome
          <span class="sr-only">(nouvelle fenêtre)</span></a
        >
        : la même barre d’outils que précédemment pour Chrome.
      </li>
    </ul>

    <p>
      Au-delà de la simple barre d’outil, d’autres outils fournissent une
      analyse complète du document en signalant visuellement sur la page les
      erreurs d’accessibilité ou à l’inverse les éléments qui lui sont
      bénéfiques ; des filtres permettent alors souvent de n’afficher que
      certains de ces aspects. C’est ce que propose Wave, une solution
      disponible à la fois
      <a class="fr-link" href="https://wave.webaim.org/" target="_blank"
        >en ligne <span class="sr-only">(nouvelle fenêtre)</span></a
      >
      et comme
      <a
        class="fr-link"
        href="https://wave.webaim.org/extension/"
        target="_blank"
        >extension de navigateur
        <span class="sr-only">(nouvelle fenêtre)</span></a
      >.
    </p>

    <p>
      La validation du code source d’un document HTML utilise le
      <a class="fr-link" href="https://validator.w3.org/" target="_blank"
        >validateur en ligne du W3C
        <span class="sr-only">(nouvelle fenêtre)</span></a
      >. À noter que pour valider le code source généré par le navigateur, il
      faut utiliser l’option "Validate by Direct Input" en y copiant la source
      HTML proposée par l’inspecteur de code du navigateur. Des extensions de
      navigateur sont aussi disponibles mais il faut être vigilant car les
      algorithmes de validation de ces extensions ne sont pas forcément à jour
      par rapport au validateur du W3C et les résultats obtenus peuvent donc
      être différents.
    </p>

    <h3>Couleurs</h3>
    <p>
      La vérification des contrastes de couleurs bénéficie de différents outils
      :
    </p>
    <ul class="fr-mb-5w">
      <li>
        <a
          class="fr-link"
          href="https://addons.mozilla.org/fr/firefox/addon/wcag-contrast-checker/"
          target="_blank"
          >WCAG Contrast checker
          <span class="sr-only">(nouvelle fenêtre)</span></a
        >
        : extension Firefox qui permet un contrôle automatique des contrastes de
        couleurs des textes d’un document
      </li>
      <li>
        <a
          class="fr-link"
          href="https://www.tpgi.com/color-contrast-checker/"
          target="_blank"
          >Color Contrast Analyser
          <span class="sr-only">(nouvelle fenêtre)</span></a
        >
        : application Windows ou Mac qui permet de contrôler des contrastes de
        couleurs
      </li>
    </ul>

    <h3>Arborescence et hierarchie</h3>
    <p>
      La vérification de l’arborescence du document et de la hiérarchie des
      titres dispose d’une extension très utile :
    </p>
    <ul class="fr-mb-5w">
      <li>
        <a
          class="fr-link"
          href="https://addons.mozilla.org/fr/firefox/addon/headingsmap/"
          target="_blank"
          >HeadingsMap pour Firefox
          <span class="sr-only">(nouvelle fenêtre)</span></a
        >
        : extension Firefox qui permet de donner un aperçu du plan du document
        et de son arborescence
      </li>
      <li>
        <a
          class="fr-link"
          href="https://chrome.google.com/webstore/detail/headingsmap/flbjommegcjonpdmenkdiocclhjacmbi?hl=en"
          target="_blank"
          >HeadingsMap pour Chrome
          <span class="sr-only">(nouvelle fenêtre)</span></a
        >
        : même extension que la précédente pour Chrome
      </li>
    </ul>

    <h3>Bureautique</h3>
    <p>
      L’analyse des fichiers bureautiques peut être réalisée au moyen de
      différents outils en fonction du format du fichier :
    </p>

    <ul class="fr-mb-5w">
      <li>
        <a
          class="fr-link"
          href="https://pdfua.foundation/en/pdf-accessibility-checker-pac"
          target="_blank"
          >PAC (PDF Accessibility Checker) version 3 pour Windows
          <span class="sr-only">(nouvelle fenêtre)</span></a
        >
        : logiciel qui permet de contrôler certains points d’accessibilité des
        documents PDF
      </li>
      <li>
        <a
          class="fr-link"
          href="https://extensions.libreoffice.org/en/extensions/show/accessodf"
          target="_blank"
          >AccessODF pour LibreOffice
          <span class="sr-only">(nouvelle fenêtre)</span></a
        >
        : extension du logiciel Microsoft Word permet d’éditer et de contrôler
        l’accessibilité d’un document bureautique éditable au format .doc ; à
        noter que les versions récentes des outils bureautiques de Microsoft
        offrent une fonctionnalité intégrée de validation de l’accessibilité
      </li>
      <li>
        <a
          class="fr-link"
          href="https://inclusivepublishing.org/toolbox/ace-by-daisy-app/"
          target="_blank"
          >Ace by DAISY App <span class="sr-only">(nouvelle fenêtre)</span></a
        >
        : est un utilitaire pour vérifier l’accessibilité d’un fichier EPUB
      </li>
    </ul>

    <h3>Photosensibilité</h3>
    <ul class="fr-mb-5w">
      <li>
        <a class="fr-link" href="https://trace.umd.edu/peat/" target="_blank"
          >PEAT (Photosensitive Epilepsy Analysis Tool) pour Windows
          <span class="sr-only">(nouvelle fenêtre)</span></a
        >
        : logiciel ancien mais toujours utile pour évaluer la potentialité de
        certains contenus web à causer des crises d’épilepsie
      </li>
    </ul>

    <h3>Allez plus loin</h3>
    <p>
      Retrouver plus d’outils sur notre site :
      <a
        class="fr-link"
        href="https://design.numerique.gouv.fr/"
        target="_blank"
        >DesignGouv <span class="sr-only">(nouvelle fenêtre)</span></a
      >
    </p>

    <TopLink />
  </section>
</template>

<style scoped>
.content {
  max-width: 49.5rem;
}
</style>
