<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

import { useAuditStats } from "../../composables/useAuditStats";
import { useResultsStore } from "../../store";
import { Audit, AuditType } from "../../types";
import { formatDate, getCriteriaCount } from "../../utils";
import AuditProgressBar from "../audit/AuditProgressBar.vue";
import SummaryCard, { SummaryCardThemes } from "../SummaryCard.vue";
import StepCard from "./StepCard.vue";

defineProps<{
  audit: Audit;
}>();

const route = useRoute();
const uniqueId = computed(() => route.params.uniqueId as string);
const resultsStore = useResultsStore();

const { complianceLevel, compliantCriteriaCount, notCompliantCriteriaCount } =
  useAuditStats();

const auditIsReady = computed(() => {
  return resultsStore.auditProgress === 1;
});

const auditIsInProgress = computed(() => {
  return resultsStore.auditProgress > 0 && resultsStore.auditProgress < 1;
});
</script>

<template>
  <StepCard>
    <div class="fr-mb-2w step-card-heading">
      <span
        v-if="auditIsReady"
        id="audit-step-status"
        class="fr-icon--lg fr-icon-checkbox-circle-fill step-card-check"
      >
        <span class="fr-sr-only">Étape terminée</span>
      </span>

      <h2
        class="fr-h3 fr-mb-0 step-card-title"
        aria-describedby="audit-step-status"
      >
        Audit
        <p
          v-if="audit.auditType"
          class="fr-badge fr-badge--info fr-badge--no-icon"
        >
          {{ getCriteriaCount(audit.auditType) }}
          critères
        </p>
      </h2>
      <RouterLink
        class="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-settings-5-line audit-step-settings-link"
        :to="{
          name: 'audit-settings',
          params: { uniqueId: audit.editUniqueId }
        }"
      >
        Modifier les paramètres
      </RouterLink>
    </div>

    <p class="fr-text--sm fr-mb-2w audit-step-date">
      <template v-if="auditIsInProgress && audit.creationDate">
        Commencé le
        <time :datetime="audit.creationDate.toString()">{{
          formatDate(audit.creationDate)
        }}</time></template
      >

      <template v-else-if="auditIsReady && audit.publicationDate">
        Terminé le
        <time :datetime="audit.publicationDate.toString()">{{
          formatDate(audit.publicationDate)
        }}</time>
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

    <div
      v-if="auditIsReady"
      :class="[
        'fr-mb-3w audit-step-charts',
        { 'audit-step-charts--full': audit.auditType === AuditType.FULL }
      ]"
    >
      <SummaryCard
        v-if="audit.auditType === AuditType.FULL"
        title="Taux global de conformité"
        :value="complianceLevel"
        unit="%"
        :theme="SummaryCardThemes.Blue"
        minimal
      />

      <SummaryCard
        title="Critères non conformes"
        :value="notCompliantCriteriaCount"
        :theme="SummaryCardThemes.Red"
        minimal
      />

      <SummaryCard
        title="Critères confomes"
        :value="compliantCriteriaCount"
        :theme="SummaryCardThemes.Green"
        minimal
      />
    </div>

    <AuditProgressBar
      v-else
      :value="resultsStore.auditProgress"
      label="Progression"
      :size="12"
      class="fr-mb-3w audit-step-progress-bar"
    />

    <ul
      :class="[
        'fr-btns-group fr-btns-group--icon-left audit-step-card-actions',
        { 'audit-step-card-actions--half': auditIsReady }
      ]"
    >
      <li>
        <RouterLink
          :to="{
            name: 'audit-generation',
            params: { uniqueId: uniqueId }
          }"
          class="fr-btn fr-btn--icon-left fr-mb-0"
          :class="
            auditIsReady
              ? 'fr-btn--tertiary fr-icon-draft-line'
              : 'fr-icon-edit-fill'
          "
        >
          {{
            auditIsReady
              ? "Accéder"
              : auditIsInProgress
                ? "Continuer"
                : "Commencer"
          }}
        </RouterLink>
      </li>
    </ul>
  </StepCard>
</template>

<style scoped>
.audit-step-settings-link {
  margin-inline-start: auto;

  @media (width < 36rem) {
    margin-inline-start: initial;
  }
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
  gap: 1.25rem;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
}

.audit-step-charts--full {
  grid-template-columns: repeat(3, 1fr);
}

.audit-step-chart {
  display: flex;
  align-items: center;
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

@media (width < 48rem) {
  .audit-step-charts {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .audit-step-chart-separator {
    display: none;
  }
}
</style>
