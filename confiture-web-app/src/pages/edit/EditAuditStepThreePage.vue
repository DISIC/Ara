<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter, onBeforeRouteLeave } from "vue-router";
import { debounce } from "lodash-es";

import AuditGenerationFilters from "../../components/AuditGenerationFilters.vue";
import AuditGenerationHeader from "../../components/AuditGenerationHeader.vue";
import AuditGenerationPageCriteria from "../../components/AuditGenerationPageCriteria.vue";
import PageMeta from "../../components/PageMeta";
import MarkdownHelpButton from "../../components/MarkdownHelpButton.vue";
import { useAuditStats } from "../../composables/useAuditStats";
import { useNotifications } from "../../composables/useNotifications";
import { useWrappedFetch } from "../../composables/useWrappedFetch";
import { useIsOffline } from "../../composables/useIsOffline";
import rgaa from "../../criteres.json";
import { history } from "../../router";
import { useAuditStore, useResultsStore } from "../../store";
import { AuditType, CriteriumResultStatus } from "../../types";
import { captureWithPayloads, getCriteriaCount } from "../../utils";
import { CRITERIA_BY_AUDIT_TYPE } from "../../criteria";

const route = useRoute();
const router = useRouter();

// const uniqueId = route.params.uniqueId as string;
const uniqueId = computed(() => route.params.uniqueId as string);
const auditStore = useAuditStore();

useWrappedFetch(async () => {
  await auditStore.fetchAuditIfNeeded(uniqueId.value);
  await resultsStore.fetchResults(uniqueId.value);
}, true);

const resultsStore = useResultsStore();
const notify = useNotifications();

/**
 * Publish audit and move to final step
 */
function toStepFour() {
  auditStore
    .publishAudit(uniqueId.value)
    .then(() => {
      router.push({
        name: "edit-audit-step-four",
        params: { uniqueId: uniqueId.value },
      });
    })
    .catch((error) => {
      notify(
        "error",
        "Une erreur est survenue",
        "Un problème empêche la sauvegarde de vos données. Contactez-nous à l'adresse contact@design.numerique.gouv.fr si le problème persiste."
      );
      captureWithPayloads(error);
    });
}

/** Available topic filters and their global progression. */
const topics = computed(() => {
  if (!auditStore.data?.auditType) {
    return [];
  }

  return (
    rgaa.topics
      // hide topics not present in audit type
      .filter((topic) => {
        return CRITERIA_BY_AUDIT_TYPE[auditStore.data!.auditType!].find(
          (criterium) => criterium.topic === topic.number
        );
      })
      .map((topic) => {
        // Every results for the current topic
        const relevantResults =
          resultsStore.allResults?.filter(
            (result) => result.topic === topic.number
          ) ?? [];

        // number of criteria for the topic accross all pages
        const relevantCount = relevantResults.length;

        // number of tested criteria for the topic accross all pages
        const testedCount =
          relevantResults.filter(
            (result) => result.status !== CriteriumResultStatus.NOT_TESTED
          ).length ?? 0;

        return {
          title: topic.topic,
          number: topic.number,
          value: Math.round((testedCount / relevantCount) * 100),
        };
      })
  );
});

const currentPageId = ref(0);

function updateCurrentPageId(i: number) {
  auditStore.updateCurrentPageId(i);
  currentPageId.value = i;
}

const {
  complianceLevel,
  notApplicableCriteriaCount,
  notCompliantCriteriaCount,
  blockingCriteriaCount,
} = useAuditStats();

const headerInfos = computed(() => [
  ...(auditStore.data?.auditType === AuditType.FULL
    ? [
        {
          title: "Taux global de conformité",
          description: "RGAA version 4.1",
          value: complianceLevel.value,
          total: 100,
          unit: "%",
          theme: "france",
        },
      ]
    : []),
  {
    title: "Critères non conformes",
    description: `Dont ${blockingCriteriaCount.value} bloquants pour l’usager`,
    value: notCompliantCriteriaCount.value,
    total: getCriteriaCount(auditStore.data?.auditType as AuditType),
    theme: "marianne",
  },
  {
    title: "Critères non applicables",
    description: `Sur un total de ${getCriteriaCount(
      auditStore.data?.auditType as AuditType
    )} critères`,
    value: notApplicableCriteriaCount.value,
    total: getCriteriaCount(auditStore.data?.auditType as AuditType),
  },
]);

function closeAuditEmailAlert() {
  auditStore.showAuditEmailAlert = false;
  focusPageHeading();
}

onBeforeRouteLeave(() => {
  auditStore.showAuditEmailAlert = false;
});

function focusPageHeading() {
  const pageHeading = document.querySelector("h1");
  pageHeading?.setAttribute("tabindex", "-1");
  pageHeading?.focus();
}

const showFilters = ref(true);

function toggleFilters(value: boolean) {
  showFilters.value = value;
}

const showDuplicatedAlert = ref(!!history.state.showDuplicatedAlert);

watch(route, () => {
  if (history.state.showDuplicatedAlert) {
    showDuplicatedAlert.value = true;
  }
});

function closeDuplicatedAuditAlert() {
  showDuplicatedAlert.value = false;
  focusPageHeading();
}

const auditNotes = computed(() => {
  return auditStore.data?.notes || "";
});

const updateAuditNotes = debounce(async (notes: string) => {
  try {
    await auditStore.updateAuditNotes(uniqueId.value, {
      notes,
    });
  } catch (error) {
    handleUpdateResultError(error);
  }
}, 500);

function handleUpdateResultError(err: any) {
  console.log(err);
  notify(
    "error",
    "Une erreur est survenue",
    "Un problème empêche la sauvegarde de vos données. Contactez-nous à l'adresse ara@design.numerique.gouv.fr si le problème persiste."
  );
}

const isOffline = useIsOffline();
</script>

<template>
  <!-- FIXME: handle loading states -->
  <template v-if="auditStore.data && resultsStore.data">
    <PageMeta
      :title="`Audit ${auditStore.data.procedureName}`"
      description="Réalisez simplement et validez votre audit d'accessibilité numérique."
    />

    <div v-if="showDuplicatedAlert" class="fr-alert fr-alert--success fr-mb-3w">
      <p class="fr-alert__title">Audit copié avec succès</p>
      <p>
        Des liens pour accéder à cet audit et de son rapport viennent de vous
        être envoyés par mail.
      </p>
      <button
        class="fr-btn--close fr-btn"
        title="Masquer le message"
        @click="closeDuplicatedAuditAlert"
      >
        Masquer le message
      </button>
    </div>

    <div
      v-if="auditStore.showAuditEmailAlert"
      class="fr-alert fr-alert--info fr-mb-3w"
    >
      <p class="fr-alert__title">Retrouvez votre audit</p>
      <p>
        Des liens pour accéder à cet audit et à son rapport viennent de vous
        être envoyés par e-mail à l’adresse
        <strong>{{ auditStore.data.auditorEmail }}</strong>
      </p>
      <button
        class="fr-btn--close fr-btn"
        title="Masquer le message"
        @click="closeAuditEmailAlert"
      >
        Masquer le message
      </button>
    </div>

    <RouterLink
      v-if="auditStore.data.publicationDate"
      class="fr-text--sm fr-mb-4w back-summary-link"
      :to="{
        name: 'edit-audit-step-four',
        params: { uniqueId },
      }"
    >
      Retour à la synthèse
    </RouterLink>

    <AuditGenerationHeader
      :audit-name="auditStore.data.procedureName"
      :key-infos="headerInfos"
      :audit-publication-date="auditStore.data.publicationDate"
      :audit-edition-date="auditStore.data.editionDate"
      :edit-unique-id="uniqueId"
    >
      <template #actions>
        <li class="fr-mr-2w">
          <component
            :is="isOffline ? 'button' : 'RouterLink'"
            class="fr-btn fr-btn--secondary"
            :to="{
              name: 'report',
              params: { uniqueId: auditStore.data?.consultUniqueId },
            }"
            target="_blank"
            :disabled="isOffline"
          >
            Consulter le rapport d'audit
            <span class="sr-only">(Nouvelle fenêtre)</span>
          </component>
        </li>
        <li
          v-if="
            !auditStore.data.publicationDate ||
            (auditStore.data.editionDate &&
              auditStore.data.editionDate > auditStore.data.publicationDate)
          "
        >
          <button
            :disabled="!resultsStore.everyCriteriumAreTested || isOffline"
            class="fr-btn"
            :aria-describedby="
              auditStore.data.publicationDate
                ? auditStore.data.editionDate
                  ? undefined
                  : 'validation-notice'
                : 'validation-notice'
            "
            @click="toStepFour"
          >
            {{
              auditStore.data.publicationDate
                ? auditStore.data.editionDate
                  ? "Mettre à jour l’audit"
                  : "Valider l’audit"
                : "Valider l’audit"
            }}
          </button>
        </li>
      </template>
      <template v-if="!resultsStore.everyCriteriumAreTested" #actions-notice>
        <p id="validation-notice" class="fr-text--xs fr-mb-1w submit-notice">
          Validation possible à la fin de l’audit
        </p>
      </template>
    </AuditGenerationHeader>

    <div class="fr-grid-row fr-grid-row--gutters columns">
      <div
        :class="[
          `fr-col-12 fr-col-md-${showFilters ? '3' : '1'}`,
          { 'fr-px-0': showFilters },
        ]"
      >
        <div
          :class="['filters-wrapper', { 'fr-px-3v': showFilters }]"
          role="search"
        >
          <AuditGenerationFilters
            :topics="topics"
            @toggle-filters="toggleFilters"
          />
        </div>
      </div>
      <div :class="`fr-col-12 fr-col-md-${showFilters ? '9' : '11'}`">
        <div class="fr-tabs">
          <ul
            class="fr-tabs__list"
            role="tablist"
            aria-label="Pages de l’audit"
          >
            <li role="presentation">
              <button
                :id="`page-panel-${auditStore.data.pages[0].id}`"
                class="fr-tabs__tab"
                tabindex="0"
                role="tab"
                aria-selected="true"
                :aria-controls="`page-panel-${auditStore.data.pages[0].id}-panel`"
              >
                {{ auditStore.data.pages[0].name }}
              </button>
            </li>
            <li
              v-for="page in auditStore.data.pages.slice(1)"
              :key="page.id"
              role="presentation"
            >
              <button
                :id="`page-panel-${page.id}`"
                class="fr-tabs__tab"
                tabindex="0"
                role="tab"
                aria-selected="false"
                :aria-controls="`page-panel-${page.id}-panel`"
              >
                {{ page.name }}
              </button>
            </li>
            <li role="presentation">
              <button
                id="notes-panel"
                class="fr-tabs__tab fr-icon-draft-line fr-tabs__tab--icon-left"
                tabindex="0"
                role="tab"
                aria-selected="false"
                :aria-controls="`notes-panel-panel`"
              >
                Notes
              </button>
            </li>
          </ul>
          <div
            v-for="page in auditStore.data.pages"
            :id="`page-panel-${page.id}-panel`"
            :key="page.id"
            class="fr-tabs__panel fr-tabs__panel--selected"
            role="tabpanel"
            :aria-labelledby="`page-panel-${page.id}`"
            tabindex="0"
            v-on="{ 'dsfr.disclose': () => updateCurrentPageId(page.id) }"
          >
            <AuditGenerationPageCriteria
              v-if="currentPageId === page.id"
              :page="page"
              :audit-unique-id="uniqueId"
            />
          </div>
          <div
            :id="`notes-panel-panel`"
            class="fr-tabs__panel fr-tabs__panel--selected"
            role="tabpanel"
            aria-labelledby="notes-panel"
            tabindex="0"
          >
            <div class="fr-input-group fr-mb-1w">
              <label class="fr-label" for="audit-notes"
                >Notes annexes
                <span class="fr-hint-text">
                  Exemple : remarques et recommandations générales sur le site
                  audité. Ces notes seront affichées dans le rapport d’audit.
                </span>
              </label>
              <textarea
                id="audit-notes"
                :value="auditNotes"
                rows="20"
                class="fr-input"
                :disabled="isOffline"
                @input="
                  updateAuditNotes(($event.target as HTMLTextAreaElement).value)
                "
              ></textarea>
            </div>

            <MarkdownHelpButton id="markdown-notice-notes" />
          </div>
        </div>
      </div>
    </div>
  </template>
</template>

<style scoped>
/* Override DSFR columns width */
.columns {
  --gap: 1.5rem;
  --filters-column-width: 2rem;
}

@media (max-width: 992px) {
  .columns {
    --gap: 1rem;
  }
}
.fr-col-md-1 {
  flex: 0 0 var(--filters-column-width) !important;
}

.fr-col-md-11 {
  flex-grow: 1 !important;
  max-width: calc(
    100% - calc(var(--filters-column-width) + var(--gap))
  ) !important; /* Sidebar width + gap */
  width: auto !important;
}

.back-summary-link {
  display: inline-block;
}

.filters-wrapper {
  position: sticky;
  top: 55px;
  max-height: 100vh;
  overflow-y: auto;
}

.submit-notice {
  text-align: right;
}
</style>
