<script setup lang="ts">
import { AxeResults } from "axe-core";
import { computed, onMounted, ref } from "vue";
import { api } from "../../api";
import { useTopicAccordions } from "../../composables/useTopicAccordionsStatus";
import { useAuditStore, useFiltersStore, useResultsStore } from "../../store";
import { AuditPage, CreateNotCompliantItemData, CriterionResultUserImpact, CriteriumResult, CriteriumResultStatus } from "../../types";
import { slugify } from "../../utils";
import TopLink from "../ui/TopLink.vue";
import AuditGenerationCriterium from "./AuditGenerationCriterium.vue";

import NotApplicableSwitch from "./NotApplicableSwitch.vue";
import TransverseElementsList from "./TransverseElementsList.vue";

const props = defineProps<{
  page: AuditPage;
  auditUniqueId: string;
}>();

const store = useFiltersStore();
const auditStore = useAuditStore();
const resultsStore = useResultsStore();

const transversePageId = computed(() => {
  return auditStore.currentAudit?.transverseElementsPage.id;
});

const noResults = computed(() => {
  if (store.hasNoResultsFromEvaluated) {
    return {
      title: "Tous les critères évalués ont été masqués",
      description:
        "Veuillez décocher le filtre \"Masquer les critères évalués\" pour afficher de nouveau les critères."
    };
  } else if (store.hasNoResultsFromComplianceLevel) {
    return {
      title: "Aucun critère ne correspond à vos filtres",
      description: [
        "Consultez les autres pages de l’échantillon",
        "Modifiez les filtres"
      ]
    };
  } else if (store.hasNoResultsFromSearch && !store.hideEvaluatedCriteria) {
    return {
      title: "Aucun résultat ne correspond à votre recherche",
      description:
        "Le système de recherche par mots clés s'applique uniquement à l’intitulé des critères."
    };
  } else {
    return {
      title: "Tous les critères évalués ont été masqués",
      description:
        "Veuillez décocher le filtre \"Masquer les critères évalués\" pour afficher de nouveau les critères."
    };
  }
});

const notApplicableSwitchRefs =
  ref<Record<number, InstanceType<typeof NotApplicableSwitch> | null>>({});

// put ref in notApplicableSwitchRefs record based on given topic number
const refFn =
  (topicNumber: number) =>
    (el: any) =>
      notApplicableSwitchRefs.value[topicNumber] =
        el as InstanceType<typeof NotApplicableSwitch>;

const {
  retrieveStatusFromLocalStorage,
  toggleStatus,
  saveStatusToLocalStorage,
  isTopicHidden
} = useTopicAccordions();

function toggleTopic(value: boolean, topic: number) {
  toggleStatus(props.auditUniqueId, props.page.id, topic, !value);
  saveStatusToLocalStorage();
}

const HTML_TAG_REGEX =
  /<\/?[a-z][a-z0-9-]*(?:\s+[a-z0-9-]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'>]+))?)*\s*\/?>/gi;

function markHtmlTags(text: string): string {
  return text.replace(HTML_TAG_REGEX, (tag) => `\`${tag}\``);
}

async function auditAutoPageClick(url: string) {
  console.log(url);

  try {
    const results = await api.post(`/api/scan`, {
      json: { url }
    }).json() as AxeResults;

    console.log(results);

    const { inapplicable, passes, violations } = results;

    // clean all results
    const tags = [...inapplicable.flatMap(x => x.tags.find((t) => t.startsWith("RGAA-"))), ...passes.flatMap(x => x.tags.find((t) => t.startsWith("RGAA-"))), ...passes.flatMap(x => x.tags.find((t) => t.startsWith("RGAA-")))];

    tags.filter(x => x !== undefined)
      .forEach((tag) => {
        const result = getResultFromTag(tag);
        if (result) {
          result.status = CriteriumResultStatus.NOT_TESTED;
          result.notApplicableComment = "";
          result.compliantComment = "";
          result.notCompliantItems = [];
          resultsStore.updateResults(props.auditUniqueId, [result]);
        }
      });

    inapplicable.forEach((ina) => {
      const tag = ina.tags.find((x) => x.startsWith("RGAA-"));
      if (tag) {
        const result = getResultFromTag(tag);

        if (result) {
          result.status = CriteriumResultStatus.NOT_APPLICABLE;

          if (result.notApplicableComment) {
            result.notApplicableComment += "\n\n";
          }

          if (ina.description) {
            result.notApplicableComment += markHtmlTags(ina.description);

            result.notApplicableComment += "\n";
          }

          result.notApplicableComment += markHtmlTags(ina.help);
          if (ina.helpUrl) {
            result.notApplicableComment += `\nSource : [${ina.helpUrl}](${ina.helpUrl})`;
          }

          resultsStore.updateResults(props.auditUniqueId, [result]);
        }
      }
    });

    passes.forEach((passe) => {
      const tag = passe.tags.find((x) => x.startsWith("RGAA-"));
      if (tag) {
        const result = getResultFromTag(tag);

        if (result) {
          result.status = CriteriumResultStatus.COMPLIANT;

          if (result.compliantComment) {
            result.notApplicableComment += "\n\n";
          }

          if (passe.description) {
            result.compliantComment += markHtmlTags(passe.description);
            result.compliantComment += "\n";
          }

          if (passe.help) {
            result.compliantComment += markHtmlTags(passe.help);
          }

          if (passe.helpUrl) {
            result.compliantComment += `\nSource : [${passe.helpUrl}](${passe.helpUrl})`;
          }

          if (passe.nodes.length) {
            result.compliantComment += "\n\n Voici les éléments concernés :";
            for (const node of passe.nodes) {
              result.compliantComment += `\n\`\`\`html\n${node.html}\n\`\`\`\n`;
            }
          }

          resultsStore.updateResults(props.auditUniqueId, [result]);
        }
      }
    });

    for (const violation of violations) {
      const tag = violation.tags.find((x) => x.startsWith("RGAA-"));

      if (tag) {
        const result = getResultFromTag(tag);

        if (result) {
          result.status = CriteriumResultStatus.NOT_COMPLIANT;

          await resultsStore.updateResults(props.auditUniqueId, [result]);

          for (const node of violation.nodes) {
            let userImpact: CriterionResultUserImpact | null = null;

            switch (violation.impact) {
              case "critical":
                userImpact = CriterionResultUserImpact.BLOCKING;
                break;

              case "minor":
                userImpact = CriterionResultUserImpact.MINOR;
                break;
              case "serious":
              case "moderate":
                userImpact = CriterionResultUserImpact.MAJOR;
                break;
            }

            let comment = null;
            if (node.failureSummary) {
              comment = node.failureSummary;
              comment += "\n\n";
            }

            if (node.html) {
              comment += `L'élément concerné :\n\`\`\`html\n${node.html}\n\`\`\`\n`;
            }

            const notCompliantItem: CreateNotCompliantItemData = {
              comment,
              userImpact,
              quickWin: false
            };

            const slug = slugify(props.page.name);

            await resultsStore.createNotCompliantItem(
              props.auditUniqueId,
              props.page.id,
              slug,
              result.topic,
              result.criterium,
              notCompliantItem as CreateNotCompliantItemData
            );
          }
        }
      }
    }
  }
  catch (error) {
    console.error("Impossible de scanner la page", error);
  }
}

function getResultFromTag(tag: string): CriteriumResult | undefined {
  const criteriums = tag.replace("RGAA-", "").split(".").map(Number);

  const topicNumber = criteriums[0];
  const criterumNumber = criteriums[1];

  return resultsStore.getCriteriumResult(
    props.page.id,
    topicNumber,
    criterumNumber
  );
}

// Set topic accordions status on page load
onMounted(() => {
  retrieveStatusFromLocalStorage();
});
</script>

<template>
  <h2 class="fr-sr-only">{{ page.name }}</h2>

  <div v-if="page.id !== transversePageId" class="fr-mb-3w page-url">
    <a class="fr-link fr-link--sm" :href="page.url" target="_blank" rel="noreferrer noopener">
      {{ page.url }} <span class="fr-sr-only">(nouvelle fenêtre)</span>
    </a>
  </div>

  <div v-if="page.id !== transversePageId" class="fr-mb-3w">
    <button class="fr-btn" type="button" @click="auditAutoPageClick(page.url)">Auditer automatiquement cette page</button>
  </div>

  <TransverseElementsList v-else class="fr-mb-3w" />

  <template v-if="store.filteredTopics.length">
    <section
      v-for="topic in store.filteredTopics"
      :key="topic.number"
      class="fr-mb-6w topic-section"
    >
      <div class="fr-mb-3w topic-header">
        <h3
          :id="`topic_${topic.number}`"
          :class="[
            'fr-my-0 fr-mr-auto topic-heading',
            {
              'topic-heading--hidden': resultsStore.topicIsNotApplicable(
                page.id,
                topic.number
              )
            }
          ]"
          tabindex="-1"
        >
          {{ topic.number }}. {{ topic.topic }}
        </h3>
        <NotApplicableSwitch
          :ref="refFn(topic.number)"
          class="na-toggle"
          :page-id="page.id"
          :topic-number="topic.number"
          :topic-title="topic.topic"
          @toggle="toggleTopic(!$event, topic.number)"
        />
        <button
          class="fr-btn fr-btn--secondary fr-btn--sm toggle-topic-button"
          :class="isTopicHidden(auditUniqueId, page.id, topic.number) ? 'fr-icon-arrow-down-s-line' : 'fr-icon-arrow-up-s-line'"
          @click="toggleTopic(
            isTopicHidden(auditUniqueId, page.id, topic.number),
            topic.number
          )"
        >
          {{ isTopicHidden(auditUniqueId, page.id, topic.number) ? 'Afficher' : 'Masquer' }} les critères de la thématique {{ topic.topic }}
        </button>
      </div>
      <template
        v-if="!isTopicHidden(auditUniqueId, page.id, topic.number)"
      >
        <ol class="fr-p-0 fr-m-0">
          <AuditGenerationCriterium
            v-for="(criterium, i) in topic.criteria"
            :key="criterium.criterium.number"
            :page="page"
            :class="{ 'fr-mb-3w': i !== topic.criteria.length - 1 }"
            :criterium="criterium.criterium"
            :topic-number="topic.number"
            :audit-unique-id="auditUniqueId"
          />
        </ol>

        <div class="fr-grid-row fr-grid-row--right">
          <TopLink target="audit-tabs" top-margin="1.5rem" />
        </div>
      </template>
    </section>
  </template>

  <div aria-live="polite" role="alert">
    <section v-if="!store.filteredTopics.length">
      <h2 class="fr-h6 fr-mb-3v">
        {{ noResults.title }}
      </h2>
      <ul v-if="Array.isArray(noResults.description)">
        <li v-for="(el, i) in noResults.description" :key="i">{{ el }}</li>
      </ul>
      <p v-else>{{ noResults.description }}</p>

      <template
        v-if="
          store.hasNoResultsFromSearch &&
            !store.hideEvaluatedCriteria &&
            !store.hasNoResultsFromEvaluated &&
            !store.hasNoResultsFromComplianceLevel
        "
      >
        <p><strong>Suggestions :</strong></p>
        <ul>
          <li>Vérifiez l’orthographe des termes de recherche</li>
          <li>Essayez un autre mot</li>
        </ul>
      </template>
    </section>
  </div>
</template>

<style scoped>
.optional-notice {
  color: var(--text-mention-grey);
}

.page-url {
  text-align: right;
  min-height: 2.75rem;
}

.topic-section {
  container-type: inline-size;
}

.topic-header {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 1rem;
  justify-content: end;
  align-items: center;
  grid-template-areas: "title na toggle";

  @container (width < 48rem) {
    justify-content: start;
    grid-template-columns: 1fr auto;
    grid-template-areas:
      "title toggle"
      "na na";
  }
}

.topic-heading {
  color: var(--text-action-high-blue-france);
  scroll-margin: 7.5rem;
  grid-area: title;

  &.topic-heading--hidden {
    color: var(--grey-625-425);
  }
}

.na-toggle {
  grid-area: na;
  justify-self: start;
}

.toggle-topic-button {
  grid-area: toggle;
}
</style>
