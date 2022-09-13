<script setup lang="ts">
import { useRoute } from "vue-router";

import { useWrappedFetch } from "../../composables/useWrappedFetch";
import { useReportStore } from "../../store";
import { formatAuditType, getCriteriaCount } from "../../utils";
import TopLink from "../../components/TopLink.vue";
import PageMeta from "../../components/PageMeta";

const report = useReportStore();

const route = useRoute();
const uniqueId = route.params.uniqueId as string;

useWrappedFetch(() => report.fetchReport(uniqueId));

/**
 * FIXME: the following info are not provided:
 * - auditor position
 * - auditor email (API)
 * - technologies
 * - derogated content
 * - tools function
 * - environment OS
 */
</script>

<template>
  <div v-if="report.data" class="content">
    <PageMeta
      title="Contexte"
      :description="`Découvrez en détails le contexte de l’audit ${report.data.procedureName}.`"
    />
    <h1 class="fr-mb-3w fr-mb-md-9v">Contexte de l’audit</h1>
    <h2 class="fr-mb-2w fr-mb-md-3w">Introduction</h2>
    <!-- FIXME: different wording per auditType? -->
    <p>
      Cet audit est un
      <strong
        >audit
        {{ formatAuditType(report.data.auditType).toLowerCase() }}</strong
      >, l’intégralité des critères du RGAA (<strong
        >{{ getCriteriaCount(report.data.auditType) }} critères</strong
      >) ont été appliqués sur l’ensemble des pages défini préalablement comme
      <a
        href="https://accessibilite.numerique.gouv.fr/obligations/evaluation-conformite/#echantillon"
        target="_blank"
        class="fr-link"
        >échantillon</a
      >.
    </p>
    <p>
      Cet audit <strong>liste chaque type d’erreur</strong> rencontré
      (non-conformité) dans les pages de l’échantillon et
      <strong
        >peut proposer une recommandation de solution pour chacune
        d’elles</strong
      >.
    </p>

    <div class="fr-callout fr-callout--blue-ecume fr-fi-warning-line">
      <h3 class="fr-callout__title">Vérifier tous les éléments de même type</h3>
      <p class="fr-callout__text">
        <strong
          >Une seule erreur (non-conformité) sur un élément de la page invalide
          un critère sur l’ensemble de la page</strong
        >. Si un élément invalide un critère,
        <strong
          >pensez à vérifier tous les éléments de même type dans la page</strong
        >. Exemple : Si une image dans une page comporte une erreur qui invalide
        un critère, pensez dans le cas où vous auriez d’autres images dans la
        page, à vérifier que chacune d’elles ne comporte pas la même erreur.
      </p>
    </div>

    <div
      class="fr-callout fr-callout--blue-ecume fr-fi-warning-line fr-mb-9v fr-mb-md-6w"
    >
      <h3 class="fr-callout__title">Vérifier les critères conformes</h3>
      <p class="fr-callout__text">
        Des critères conformes peuvent avoir des commentaires visant à améliorer
        la qualité des éléments concernés, pensez à vérifier ces derniers.
      </p>
    </div>

    <h2 class="fr-mb-2w fr-mb-md-3w">Auditeur</h2>

    <p class="fr-mb-9v fr-mb-md-6w">
      Cet audit a été réalisé par
      <strong>{{ report.data.context.auditorName }}</strong
      >. Pour toute questions relative à cet audit, vous pouvez contacter
      l’auditeur par e-mail à l’adresse suivante :
      <strong>{{ report.data.context.auditorEmail }}</strong
      >.
    </p>

    <h2 class="fr-mb-2w fr-mb-md-3w">Méthodologie et référentiel</h2>
    <p>
      La méthodologie utilisée pour réaliser cet audit repose sur le
      <strong
        >référentiel général d’amélioration de l’accessibilité (RGAA)
        4.1</strong
      >.
    </p>

    <p class="fr-mb-9v fr-mb-md-6w">
      <a
        href="https://accessibilite.numerique.gouv.fr/ressources/methodologie-de-test/"
        target="_blank"
        class="fr-link"
        >Plus d’information sur la méthodologie de test</a
      >
    </p>

    <h2 class="fr-mb-2w fr-mb-md-3w">Technologies</h2>

    <p>Les technologies utilisées sur le site audité sont les suivantes :</p>

    <ul class="fr-mb-9v fr-mb-md-6w">
      <li v-for="tech in report.data.context.technologies" :key="tech">
        {{ tech }}
      </li>
    </ul>

    <h2 class="fr-mb-2w fr-mb-md-3w">Échantillon</h2>

    <p>
      L’audit a porté sur un échantillon de
      <strong>{{ report.data.context.samples.length }} pages</strong> :
    </p>

    <div class="fr-table fr-table--bordered fr-table--no-caption fr-mb-3w">
      <table>
        <caption>
          Échantillon de pages auditées
        </caption>
        <thead>
          <tr>
            <th scope="col">N°</th>
            <th scope="col">Nom de la page</th>
            <th scope="col">URL</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(page, i) in report.data.context.samples" :key="i">
            <td>{{ i + 1 }}</td>
            <td>{{ page.name }}</td>
            <td>
              <RouterLink class="fr-link" target="_blank" :to="page.url">
                {{ page.url }}
              </RouterLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <h3 class="fr-h4 fr-mb-3v fr-mb-md-2w">Contenus dérogés</h3>

    <p>
      La dérogation est un moyen d’exclure du champ d’application du référentiel
      des contenus particuliers.
    </p>

    <ul class="fr-mb-2w">
      <li>Aucun contenu n’est dérogé dans cet audit</li>
    </ul>

    <!-- TODO: link destination -->
    <p class="fr-mb-9v fr-mb-md-6w">
      <RouterLink to="#" target="_blank" class="fr-link"
        >Plus d’information sur les contenus dérogés</RouterLink
      >
    </p>

    <h2 class="fr-mb-2w fr-mb-md-3w">Outils d’assistance</h2>

    <p>
      L’outil le plus utilisé pour réaliser cet audit a été l’inspecteur de code
      que propose chaque navigateur. Un ensemble d’outils ont également été
      utilisés afin de s’assurer d’une restitution correcte de contenus
      accessibles dans le cas où l’examen du code seul n’a pas suffit.
    </p>

    <div class="fr-table fr-table--bordered fr-table--no-caption fr-mb-3w">
      <table>
        <caption>
          Outils d’assistance
        </caption>
        <thead>
          <tr>
            <th scope="col">Nom</th>
            <th scope="col">Fonction</th>
            <th scope="col">URL</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(tool, i) in report.data.context.tools" :key="i">
            <td>{{ tool.name }}</td>
            <td>{{ tool.function }}</td>
            <td>
              <RouterLink class="fr-link" target="_blank" :to="tool.url">
                {{ tool.url }}
              </RouterLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- TODO: link destination -->
    <p class="fr-mb-9v fr-mb-md-6w">
      <RouterLink to="#" target="_blank" class="fr-link"
        >Plus d’information sur les outils d’assistance</RouterLink
      >
    </p>

    <h2 class="fr-mb-2w fr-mb-md-3w">Environnement de test</h2>

    <p>
      La restitution des contenus avec les outils d’assistance a été testée
      conformément aux environnements de test suivants :
    </p>

    <h3 class="fr-h4 fr-mb-3v fr-mb-md-2w">Ordinateur</h3>

    <div class="fr-table fr-table--bordered fr-table--no-caption fr-mb-3w">
      <table>
        <caption>
          Environnements de test sur ordinateur
        </caption>
        <thead>
          <tr>
            <th scope="col">Technologie d’assistance</th>
            <th scope="col">Navigateur</th>
            <th scope="col">Système d’exploitation</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(env, i) in report.data.context.desktopEnvironments"
            :key="i"
          >
            <td>{{ env.assistiveTechnology }}</td>
            <td>{{ env.browser }}</td>
            <td>{{ env.os }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <h3 class="fr-h4 fr-mb-3v fr-mb-md-2w">Mobile</h3>

    <div class="fr-table fr-table--bordered fr-table--no-caption fr-mb-3w">
      <table>
        <caption>
          Environnements de test sur mobile
        </caption>
        <thead>
          <tr>
            <th scope="col">Technologie d’assistance</th>
            <th scope="col">Navigateur</th>
            <th scope="col">Système d’exploitation</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(env, i) in report.data.context.mobileEnvironments"
            :key="i"
          >
            <td>{{ env.assistiveTechnology }}</td>
            <td>{{ env.browser }}</td>
            <td>{{ env.os }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- TODO: link destination -->
    <p>
      <RouterLink to="#" target="_blank" class="fr-link"
        >Plus d’information sur l’environnement de test</RouterLink
      >
    </p>

    <TopLink />
  </div>
</template>

<style scoped>
.content > *:not(.fr-table) {
  max-width: 49.5rem;
}
</style>
