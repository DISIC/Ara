<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

import { useAuditStats } from "../../composables/useAuditStats";
import { useResultsStore } from "../../store";
import { Audit } from "../../types";
import { formatDate, getCriteriaCount, pluralize } from "../../utils";
import StepCard from "./StepCard.vue";
import AuditProgressBar from "../AuditProgressBar.vue";
import StatDonut from "../StatDonut.vue";

defineProps<{
  audit: Audit;
}>();

const route = useRoute();
const uniqueId = computed(() => route.params.uniqueId as string);
const resultsStore = useResultsStore();

const {
  complianceLevel,
  notApplicableCriteriaCount,
  notCompliantCriteriaCount,
  errorsCount,
} = useAuditStats();

const auditIsReady = computed(() => {
  return resultsStore.auditProgress === 1;
});

const auditIsInProgress = computed(() => {
  return resultsStore.auditProgress > 0 && resultsStore.auditProgress < 1;
});
</script>

<template>
  <StepCard :checked="auditIsReady">
    <h2 class="fr-h3 fr-mb-1w audit-step-title">
      Audit
      <p v-if="audit.auditType" class="fr-badge">
        {{ getCriteriaCount(audit.auditType) }}
        critères
      </p>
    </h2>

    <p class="fr-text--sm fr-mb-2w audit-step-date">
      <template v-if="auditIsInProgress && audit.creationDate">
        Commencé le
        <time :datetime="audit.creationDate.toString()">{{
          formatDate(audit.creationDate)
        }}</time></template
      >
      <!-- FIXME: publicationDate -->
      <template v-else-if="auditIsReady">
        Terminé le
        <time datetime="XX/XX/XXX">{{ "XX/XX/XXX" }}</time>
        <template v-if="audit.editionDate">
          - Mis à jour le
          <time :datetime="audit.editionDate.toString()">{{
            formatDate(audit.editionDate)
          }}</time></template
        >
      </template>
      <template v-else-if="audit.creationDate">
        Créé le
        <time :datetime="audit.creationDate.toString()">{{
          formatDate(audit.creationDate)
        }}</time>
      </template>
    </p>

    <div v-if="auditIsReady" class="fr-mb-3w audit-step-charts">
      <div class="audit-step-chart">
        <StatDonut
          :value="complianceLevel"
          :total="100"
          unit="%"
          theme="france"
          size="sm"
        />

        <div class="card-info">
          <p class="fr-text--bold fr-mb-1v">Taux global de conformité</p>
          <p class="fr-text--xs fr-mb-0">RGAA version 4.1</p>
        </div>
      </div>
      <span aria-hidden="true" class="audit-step-chart-separator" />
      <div class="audit-step-chart">
        <StatDonut
          :value="notCompliantCriteriaCount"
          :total="getCriteriaCount(audit.auditType)"
          theme="marianne"
          size="sm"
        />

        <div class="card-info">
          <p class="fr-text--bold fr-mb-1v">
            {{
              `${pluralize(
                "Critère",
                "Critères",
                errorsCount.total
              )} non ${pluralize("conforme", "conformes", errorsCount.total)}`
            }}
          </p>
          <p class="fr-text--xs fr-mb-0">
            {{
              `${errorsCount.blocking} ${pluralize(
                "bloquant",
                "bloquants",
                errorsCount.blocking
              )}`
            }}
          </p>
        </div>
      </div>
      <span aria-hidden="true" class="audit-step-chart-separator" />
      <div class="audit-step-chart">
        <StatDonut
          :value="notApplicableCriteriaCount"
          :total="getCriteriaCount(audit.auditType)"
          size="sm"
        />

        <div class="card-info">
          <p class="fr-text--bold fr-mb-1v">
            {{ pluralize("Critère", "Critères", notApplicableCriteriaCount) }}
            non
            {{
              pluralize("applicable", "applicables", notApplicableCriteriaCount)
            }}
          </p>
          <p class="fr-text--xs fr-mb-0">
            Sur {{ getCriteriaCount(audit.auditType) }} critères
          </p>
        </div>
      </div>
    </div>

    <AuditProgressBar
      v-else
      label="Progression"
      is-large
      class="fr-mb-3w audit-step-progress-bar"
    />

    <ul
      :class="[
        'fr-btns-group fr-btns-group--icon-left audit-step-card-actions',
        { 'audit-step-card-actions--half': auditIsReady },
      ]"
    >
      <li>
        <RouterLink
          :to="{
            name: 'edit-audit-step-three',
            params: { uniqueId: uniqueId },
          }"
          class="fr-btn fr-btn--icon-left fr-mb-0"
          :class="
            auditIsReady
              ? 'fr-btn--secondary fr-icon-draft-line'
              : 'fr-icon-edit-fill'
          "
        >
          {{ auditIsReady ? "Accéder" : "Commencer" }}
        </RouterLink>
      </li>
    </ul>
  </StepCard>
</template>

<style scoped>
.audit-step-title {
  grid-column: 1 / -1;
  grid-row: 1;
}

.audit-step-date {
  color: var(--text-mention-grey);
  grid-column: 1 / -1;
  grid-row: 2;
}

.audit-step-progress-bar {
  grid-column: 1 / -1;
  grid-row: 3;
}

.audit-step-charts {
  grid-column: 1 / -1;
  grid-row: 3;
  display: grid;
  grid-template-columns: 1fr auto 1fr auto 1fr;
}

.audit-step-chart {
  display: flex;
  gap: 0.75rem;
}

.audit-step-chart-separator {
  width: 1px;
  background: var(--border-default-grey);
  height: 100%;
  margin-left: 0.5rem;
  margin-right: 1rem;
}

.audit-step-card-actions {
  grid-column: 1 / -1;
}

.audit-step-card-actions--half {
  grid-column: 1;
}

@media (max-width: 48rem) {
  .audit-step-charts {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .audit-step-chart-separator {
    display: none;
  }
}
</style>
