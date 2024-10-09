<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";

import PageMeta from "../components/PageMeta";
import MarkdownRenderer from "../components/ui/MarkdownRenderer.vue";
import { useNotifications } from "../composables/useNotifications";
import { useWrappedFetch } from "../composables/useWrappedFetch";
import { useReportStore } from "../store";
import { AuditStatus } from "../types";
import { formatDate, getAuditStatus } from "../utils";

const report = useReportStore();

const route = useRoute();
const uniqueId = route.params.uniqueId as string;

useWrappedFetch(() => report.fetchReport(uniqueId));

const notify = useNotifications();

async function copyA11yStatementUrl() {
  const url = `${window.location.origin}/declaration/${uniqueId}`;

  navigator.clipboard.writeText(url).then(() => {
    showCopyAlert.value = true;

    notify(
      "success",
      undefined,
      "Le lien vers la déclaration a bien été copié dans le presse-papier."
    );
  });
}

function getA11yLevel() {
  if (report.data!.accessibilityRate === 100) {
    return "totalement";
  } else if (report.data!.accessibilityRate >= 50) {
    return "partiellement";
  } else {
    return "non";
  }
}

const statementContainerRef = ref<HTMLDivElement>();
const showCopyAlert = ref(false);

async function copyA11yStatementHTML() {
  const tagsWithSpacesRegex = /<(?<tagName>\S+)(\s+)>/g; // "<XX  >"
  const whitespaceFollowedTags = /<(?<tagName>p)>\s{1}/g; // "<p> "
  const whitespaceFollowingTags = /\s{1}<\/(?<tagName>p)>/g; // " </p>"
  const oneLineBreakTags = /<(?<tagName>\/li|ul)>/g; // "</li>" or "<ul>"
  const twoLineBreakTags = /<\/(?<tagName>h1|h2|h3|p|ul)>/g; // "</XX>"
  const indentedTags = /<(?<tagName>li)>/g; // "<li>"

  const html = statementContainerRef.value?.innerHTML
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
    .replaceAll(/data-v-.*?=""/g, "")

    // Insert line breaks, indentation and remove extra whitespaces
    .replaceAll(tagsWithSpacesRegex, "<$<tagName>>")
    .replaceAll(whitespaceFollowedTags, "<$<tagName>>")
    .replaceAll(whitespaceFollowingTags, "</$<tagName>>")
    .replaceAll(oneLineBreakTags, "<$<tagName>>\n")
    .replaceAll(twoLineBreakTags, "</$<tagName>>\n\n")
    .replaceAll(indentedTags, "  <$<tagName>>");

  if (html) {
    navigator.clipboard.writeText(html).then(() => {
      notify(
        "success",
        undefined,
        "Le code HTML de la déclaration d’accessibilité a bien été copié dans le presse-papier."
      );
    });
  }
}

const statementIsPublished = computed(() => {
  return !!report.data?.procedureInitiator;
});

const siteUrl = computed(() => {
  if (report.data) {
    return (
      report.data.procedureUrl ||
      new URL(report.data.context.samples[0].url).origin
    );
  }

  return null;
});
</script>

<template>
  <template v-if="report.data">
    <PageMeta title="Déclaration d’accessibilité" />

    <div class="fr-mb-4w heading">
      <h1 class="fr-m-0">Déclaration d’accessibilité</h1>
      <button
        class="fr-btn fr-btn--secondary fr-btn--icon-left fr-icon-links-fill"
        @click="copyA11yStatementUrl"
      >
        Copier le lien de la déclaration
      </button>
    </div>

    <div v-if="!statementIsPublished" class="fr-alert fr-alert--info">
      <p class="fr-alert__title">Déclaration d’accessibilité indisponible</p>
      <p>
        L’auditeur ou l’auditrice n’a pas encore rédigé la déclaration
        d’accessibilité.
      </p>
    </div>

    <template v-else>
      <p class="fr-text--lead fr-mb-2w">{{ report.data.procedureName }}</p>

      <p
        v-if="
          getAuditStatus(report.data) === AuditStatus.IN_PROGRESS &&
          report.data.creationDate
        "
        class="fr-text--light fr-mb-4w dates"
      >
        Commencé le {{ formatDate(report.data.creationDate) }}
      </p>

      <p
        v-else-if="report.data.publishDate"
        class="fr-text--light fr-mb-4w dates"
      >
        Publié le {{ formatDate(report.data.publishDate) }}
        <template v-if="report.data.updateDate">
          - Mis à jour le {{ formatDate(report.data.updateDate) }}
        </template>
      </p>

      <p class="fr-mb-1v">
        URL du site :
        <a v-if="siteUrl" class="fr-link" target="_blank" :href="siteUrl">
          {{ siteUrl }}
          <span class="fr-sr-only">(nouvelle fenêtre)</span>
        </a>
        <template v-else>Non renseignée</template>
      </p>

      <p class="fr-mb-9w">
        Rapport d’audit :
        <RouterLink
          class="fr-link"
          target="_blank"
          :to="{ name: 'report', params: { uniqueId } }"
        >
          accéder au rapport d’audit
          <span class="fr-sr-only">(nouvelle fenêtre)</span>
        </RouterLink>
      </p>

      <div class="content">
        <h2>Comment publier la déclaration</h2>

        <ol class="fr-mb-5w">
          <li>
            Vérifier les informations contenues dans la déclaration ci-dessous.
          </li>
          <li>
            Publier sur votre site cette déclaration dans une page dédiée.
          </li>
          <li>
            Dès la page d’accueil et sur toutes les pages de votre site,
            afficher la mention “<strong
              >Accessibilité : {{ getA11yLevel() }} conforme</strong
            >”. Cette mention peut être par exemple, un lien dans le pied de
            page vers la page contenant votre déclaration.
          </li>
        </ol>

        <h2>Document à intégrer sur le site audité</h2>

        <p>
          Cette déclaration d’accessibilité adopte un format obligatoire donné
          par le Référentiel général d'amélioration de l'accessibilité (RGAA).
          Vous devez publier l’intégralité de cette déclaration.
        </p>

        <button
          class="fr-btn fr-btn--secondary fr-btn--icon-left fr-icon-links-fill fr-mb-4w"
          @click="copyA11yStatementHTML"
        >
          Copier le code HTML de la déclaration
        </button>

        <div ref="statementContainerRef" class="fr-p-9v statement-container">
          <h3 class="fr-h1">Déclaration d’accessibilité</h3>
          <p>
            <strong>{{ report.data.procedureInitiator }}</strong> s’engage à
            rendre ses sites internet, intranet, extranet et ses progiciels
            accessibles (et ses applications mobiles et mobilier urbain
            numérique) conformément à l’article 47 de la loi n°2005-102 du 11
            février 2005.
          </p>

          <p class="fr-mb-9v fr-mb-md-6w">
            Cette déclaration d’accessibilité s’applique à
            <strong>{{ report.data.procedureUrl }}</strong
            >.
          </p>

          <h4 class="fr-h2">État de conformité</h4>
          <p class="fr-mb-9v fr-mb-md-6w">
            <strong
              >{{ report.data.procedureName }}
              <a target="_blank" :href="report.data.procedureUrl">
                {{ report.data.procedureUrl }}
              </a></strong
            >
            est <strong>{{ getA11yLevel() }}</strong> conforme avec le
            référentiel général d’amélioration de l’accessibilité (RGAA).
          </p>

          <h4 class="fr-h2">Résultats des tests</h4>
          <p class="fr-mb-9v fr-mb-md-6w">
            L’audit de conformité réalisé par
            <strong>{{ report.data.context.auditorOrganisation }}</strong>
            révèle que <strong>{{ report.data.accessibilityRate }}%</strong> des
            critères du RGAA version 4 sont respectés.
          </p>

          <template
            v-if="
              report.data.notCompliantContent ||
              report.data.derogatedContent ||
              report.data.notInScopeContent
            "
          >
            <h4 class="fr-h2 fr-mb-2w fr-mb-md-3w">Contenus non accessibles</h4>

            <template v-if="report.data.notCompliantContent">
              <h5 class="fr-h3">Non-conformités</h5>
              <MarkdownRenderer
                class="fr-mb-2w fr-mb-md-3w"
                :markdown="report.data.notCompliantContent"
              />
            </template>

            <template v-if="report.data.derogatedContent">
              <h5 class="fr-h3">Dérogations pour charge disproportionnée</h5>
              <MarkdownRenderer
                class="fr-mb-2w fr-mb-md-3w"
                :markdown="report.data.derogatedContent"
              />
            </template>

            <template v-if="report.data.notInScopeContent">
              <h5 class="fr-h3">
                Contenus non soumis à l’obligation d’accessibilité
              </h5>
              <MarkdownRenderer
                class="fr-mb-2w fr-mb-md-3w"
                :markdown="report.data.notInScopeContent"
              />
            </template>
          </template>

          <h4 class="fr-h2">
            Établissement de cette déclaration d’accessibilité
          </h4>
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

          <h5 class="fr-h3">
            Technologies utilisées pour la réalisation de l’audit
          </h5>
          <ul class="fr-mb-2w fr-mb-md-3w">
            <li v-for="tech in report.data.context.technologies" :key="tech">
              {{ tech }}
            </li>
          </ul>

          <template v-if="report.data.context.environments">
            <h5 class="fr-h3">Environnement de test</h5>
            <p>
              Les vérifications de restitution de contenus ont été réalisées sur
              la base de la combinaison fournie par la base de référence du
              RGAA, avec les versions suivantes :
            </p>
            <ul class="fr-mb-2w fr-mb-md-3w">
              <li v-for="(env, i) in report.data.context.environments" :key="i">
                Sur {{ env.platform }} {{ env.operatingSystem }} avec
                {{ env.browser }} et
                {{ env.assistiveTechnology }}
              </li>
            </ul>
            <h5 class="fr-h3">Outils pour évaluer l’accessibilité</h5>
            <ul class="fr-mb-2w fr-mb-md-3w">
              <li v-for="tool in report.data.context.tools" :key="tool">
                {{ tool }}
              </li>
            </ul>
          </template>

          <h5 class="fr-h3">
            Pages du site ayant fait l’objet de la vérification de conformité
          </h5>
          <ul class="fr-mb-9v fr-mb-md-6w">
            <li v-for="page in report.data.context.samples" :key="page.name">
              {{ page.name }} <strong class="page-url">{{ page.url }}</strong>
            </li>
          </ul>
          <h4 class="fr-h2">Retour d’information et contact</h4>
          <p>
            Si vous n’arrivez pas à accéder à un contenu ou à un service, vous
            pouvez contacter le responsable de
            {{ report.data.procedureName }} pour être orienté vers une
            alternative accessible ou obtenir le contenu sous une autre forme.
          </p>
          <ul class="fr-mb-9v fr-mb-md-6w">
            <li v-if="report.data.contactFormUrl">
              Envoyer un message
              <strong>{{ report.data.contactFormUrl }}</strong>
            </li>
            <li v-if="report.data.contactEmail">
              Contacter
              <strong
                >{{ report.data.procedureInitiator }} :
                {{ report.data.contactEmail }}</strong
              >
            </li>
          </ul>

          <h4 class="fr-h2">Voies de recours</h4>
          <p>
            Si vous constatez un défaut d’accessibilité vous empêchant d’accéder
            à un contenu ou une fonctionnalité du site, que vous nous le
            signalez et que vous ne parvenez pas à obtenir une réponse de notre
            part, vous êtes en droit de faire parvenir vos doléances ou une
            demande de saisine au Défenseur des droits.
          </p>

          <p>Plusieurs moyens sont à votre disposition :</p>
          <ul>
            <li>
              <a
                href="https://formulaire.defenseurdesdroits.fr/formulaire_saisine"
                target="_blank"
              >
                Écrire un message au Défenseur des droits
              </a>
            </li>
            <li>
              <a
                href="https://www.defenseurdesdroits.fr/carte-des-delegues"
                target="_blank"
              >
                Contacter le délégué du Défenseur des droits dans votre région
              </a>
            </li>
          </ul>

          <p>
            Envoyer un courrier par la poste (gratuit, ne pas mettre de timbre)
            Défenseur des droits Libre réponse 71120 75342 Paris CEDEX 07
          </p>
        </div>
      </div>
    </template>
  </template>
</template>

<style scoped>
.heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.info-container {
  max-width: 49.5rem;
}

.content {
  max-width: 58rem;
}

.statement-container {
  border: 1px solid var(--border-default-grey);
}

.page-url {
  word-break: break-all;
}
</style>
