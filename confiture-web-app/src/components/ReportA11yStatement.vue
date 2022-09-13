<script setup lang="ts">
import { ref } from "vue";
import { useRoute } from "vue-router";

import { useWrappedFetch } from "../composables/useWrappedFetch";
import { useReportStore } from "../store";
import { formatDate } from "../utils";

const report = useReportStore();

const route = useRoute();
const uniqueId = route.params.uniqueId as string;

useWrappedFetch(() => report.fetchReport(uniqueId));

function getA11yLevel() {
  if (report.data!.accessibilityRate === 100) {
    return "totalement";
  } else if (report.data!.accessibilityRate >= 50) {
    return "partiellement";
  } else {
    return "non";
  }
}

const statementRef = ref<HTMLDivElement>();
const showCopyAlert = ref(false);

async function copyA11yStatementHTML() {
  const html = statementRef.value?.innerHTML
    // Replace heading levels
    .replaceAll("<h3", "<h1")
    .replaceAll("</h3>", "</h1>")
    .replaceAll("<h4", "<h2")
    .replaceAll("</h4>", "</h2>")
    .replaceAll("<h5", "<h3")
    .replaceAll("</h5>", "</h3>")

    // Remove class attributes
    .replaceAll(/class="[a-zA-Z0-9:;.\s()\-,]*"/g, "")
    // Remove comments
    .replaceAll(/(<!--.*?-->)|(<!--[\S\s]+?-->)|(<!--[\S\s]*?$)/g, "")

    // Remove Vue.js data attributes
    .replaceAll(/data-v-.*?=""/g, "");

  if (html) {
    navigator.clipboard
      .writeText(html)
      .then(() => {
        showCopyAlert.value = true;
      })
      .catch((err) => {
        console.error(
          `Error copying a11y statement HTML to the clipboard: ${err}.`
        );
      });
  }
}

function hideCopyAlert() {
  showCopyAlert.value = false;
}

/**
 * Missing a lot of data:
 * - entity name (API)
 * - schéma pluriannuel + plan d'action url
 * - RGAA grid url
 * - contact name + email (API)
 * - contact form URL (API)
 * - derogated content
 */
</script>

<template>
  <template v-if="report.data">
    <p>
      Vous pouvez publier dès maintenant cette déclaration d’accessibilité sur
      votre site
    </p>
    <ol>
      <li>
        Vérifier les informations contenu dans ce document et corrigez si besoin
      </li>
      <li>
        Publier sur votre site cette déclaration d’accessibilité dans une page
        dédiée.
      </li>
      <li>
        Dès la page d’accueil et sur toutes les pages, afficher la mention
        <strong>“Accessibilité : {{ getA11yLevel() }} conforme”</strong>. Cette
        mention peut être un lien, par exemple dans le pied de page, vers cette
        déclaration.
      </li>
    </ol>
    <p class="fr-mb-9v fr-mb-md-6w">
      <!-- TODO: link destination -->
      <a href="#" class="fr-link" target="_blank"
        >Tout savoir sur la déclaration d’accessibilité</a
      >
    </p>

    <!-- FIXME: icon "copy" does not seem to exist -->
    <button
      class="fr-btn fr-btn--icon-right fr-icon-file-line fr-mb-4w"
      @click="copyA11yStatementHTML"
      @blur="hideCopyAlert"
    >
      Copier le code HTML
    </button>

    <div role="alert" aria-live="polite">
      <div
        v-if="showCopyAlert"
        class="fr-alert fr-alert--success fr-alert--sm fr-mb-2w"
      >
        <p>
          Le code
          <abbr title="Hypertext Markup Language">HTML</abbr> de la déclaration
          d’accessibilité a bien été copié dans le presse-papier.
        </p>
      </div>
    </div>

    <div ref="statementRef" class="fr-p-6w statement-container">
      <h3 class="fr-h2">Déclaration d’accessibilité</h3>
      <p>
        <strong>{{ report.data.procedureInitiator }}</strong> s’engage à rendre
        ses sites internet, intranet, extranet et ses progiciels accessibles (et
        ses applications mobiles et mobilier urbain numérique) conformément à
        l’article 47 de la loi n°2005-102 du 11 février 2005.
      </p>
      <p>
        À cette fin, <strong>{{ report.data.procedureInitiator }}</strong> met
        en œuvre la stratégie et les actions suivantes :
      </p>
      <ul>
        <li>
          Schéma pluriannuel de mise en accessibilité 2022-2024
          <strong>[url]</strong> ;
        </li>
        <li>Actions réalisées en 2020-2021 <strong>[url]</strong> ;</li>
        <li>Plan d’actions 2022-2024 <strong>[url]</strong>.</li>
      </ul>
      <p class="fr-mb-9v fr-mb-md-6w">
        Cette déclaration d’accessibilité s’applique à
        <strong>{{ report.data.procedureUrl }}</strong
        >.
      </p>

      <h4 class="fr-h2">État de conformité</h4>
      <p class="fr-mb-9v fr-mb-md-6w">
        <strong
          >{{ report.data.procedureName }} ({{
            report.data.procedureUrl
          }})</strong
        >
        est <strong>{{ getA11yLevel() }}</strong> conforme avec le référentiel
        général d’amélioration de l’accessibilité (RGAA), version 4 en raison
        des non-conformités et des dérogations énumérées ci-dessous.
      </p>

      <h4 class="fr-h2">Résultats des tests</h4>
      <p>
        L’audit de conformité réalisé par
        <strong>{{ report.data.procedureInitiator }}</strong> révèle que :
      </p>
      <ul class="fr-mb-9v fr-mb-md-6w">
        <li>
          <strong>[nn]</strong>% des critères du RGAA version 4 sont respectés ;
        </li>
        <li>
          (Facultatif) Le taux moyen de conformité du site s’élève à
          <strong>{{ report.data.accessibilityRate }}</strong
          >% ;
        </li>
        <li>
          (Facultatif) Accès à la grille d’audit RGAA
          <strong>[url]</strong> pour télécharger la grille d’audit.
        </li>
      </ul>

      <h4 class="fr-h2 fr-mb-2w fr-mb-md-3w">Contenus non accessibles</h4>
      <h5 class="fr-h3">Non-conformités</h5>
      <p class="fr-mb-2w fr-mb-md-3w">
        {{ report.data.notCompliantContent }}
      </p>

      <h5 class="fr-h3">Dérogations pour charge disproportionnée</h5>
      <p class="fr-mb-2w fr-mb-md-3w">{{ report.data.derogatedContent }}</p>

      <h5 class="fr-h3">Contenus non soumis à l’obligation d’accessibilité</h5>
      <p class="fr-mb-2w fr-mb-md-3w">{{ report.data.notInScopeContent }}</p>

      <h4 class="fr-h2">Établissement de cette déclaration d’accessibilité</h4>
      <p v-if="report.data.publishDate" class="fr-mb-2w fr-mb-md-3w">
        Cette déclaration a été établie le
        <strong>{{ formatDate(report.data.publishDate) }}</strong
        >.
        <template v-if="report.data.updateDate"
          >Elle a été mise à jour le
          <strong>{{ formatDate(report.data.updateDate) }}</strong
          >.</template
        >
      </p>

      <h5 class="fr-h3">Technologies utilisées pour la réalisation l’audit</h5>
      <ul class="fr-mb-2w fr-mb-md-3w">
        <li v-for="tech in report.data.context.technologies" :key="tech">
          {{ tech }}
        </li>
      </ul>

      <h5 class="fr-h3">Environnement de test</h5>
      <p>
        Les vérifications de restitution de contenus ont été réalisées sur la
        base de la combinaison fournie par la base de référence du RGAA, avec
        les versions suivantes :
      </p>
      <ul class="fr-mb-2w fr-mb-md-3w">
        <!-- TODO: format browser + AT (PR #53) -->
        <template v-if="report.data.context.desktopEnvironments.length">
          <li
            v-for="(env, i) in report.data.context.desktopEnvironments"
            :key="i"
          >
            Sur ordinateur {{ env.operatingSystem }}
            <template v-if="env.operatingSystemVersion">{{
              env.operatingSystemVersion
            }}</template>
            avec {{ env.browser }}
            <template v-if="env.browserVersion">{{
              env.browserVersion
            }}</template>
            et
            {{ env.assistiveTechnology }}
            <template v-if="env.assistiveTechnologyVersion">{{
              env.assistiveTechnologyVersion
            }}</template>
          </li>
        </template>
        <template v-if="report.data.context.mobileEnvironments.length">
          <li
            v-for="(env, i) in report.data.context.mobileEnvironments"
            :key="i"
          >
            Sur mobile {{ env.operatingSystem }}
            <template v-if="env.operatingSystemVersion">{{
              env.operatingSystemVersion
            }}</template>
            avec {{ env.browser }}
            <template v-if="env.browserVersion">{{
              env.browserVersion
            }}</template>
            et
            {{ env.assistiveTechnology }}
            <template v-if="env.assistiveTechnologyVersion">{{
              env.assistiveTechnologyVersion
            }}</template>
          </li>
        </template>
      </ul>
      <h5 class="fr-h3">Outils pour évaluer l’accessibilité</h5>
      <ul class="fr-mb-2w fr-mb-md-3w">
        <li v-for="tool in report.data.context.tools" :key="tool.name">
          {{ tool.name }}
        </li>
      </ul>
      <h5 class="fr-h3">
        Pages du site ayant fait l’objet de la vérification de conformité
      </h5>
      <ul class="fr-mb-9v fr-mb-md-6w">
        <li v-for="page in report.data.context.samples" :key="page.name">
          {{ page.name }} <strong>{{ page.url }}</strong>
        </li>
      </ul>
      <h4 class="fr-h2">Retour d’information et contact</h4>
      <p>
        Si vous n’arrivez pas à accéder à un contenu ou à un service, vous
        pouvez contacter le responsable de [nom du site] pour être orienté vers
        une alternative accessible ou obtenir le contenu sous une autre forme.
      </p>
      <ul class="fr-mb-9v fr-mb-md-6w">
        <li>
          Envoyer un message <strong>{{ report.data.contactFormUrl }}</strong> ;
        </li>
        <li>
          Contacter
          <strong
            >{{ report.data.procedureInitiator }} :
            {{ report.data.contactFormUrl }}</strong
          >.
        </li>
      </ul>

      <h4 class="fr-h2">Voies de recours</h4>
      <p>
        Si vous constatez un défaut d’accessibilité vous empêchant d’accéder à
        un contenu ou une fonctionnalité du site, que vous nous le signalez et
        que vous ne parvenez pas à obtenir une réponse de notre part, vous êtes
        en droit de faire parvenir vos doléances ou une demande de saisine au
        Défenseur des droits.
      </p>

      <p>Plusieurs moyens sont à votre disposition :</p>
      <ul>
        <li>Écrire un message au Défenseur des droits</li>
        <li>Contacter le délégué du Défenseur des droits dans votre région</li>
      </ul>

      <p>
        Envoyer un courrier par la poste (gratuit, ne pas mettre de timbre)
        Défenseur des droits Libre réponse 71120 75342 Paris CEDEX 07
      </p>
    </div>
  </template>
</template>

<style scoped>
.statement-container {
  border: 1px solid var(--border-default-grey);
}
</style>
