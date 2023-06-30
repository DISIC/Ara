<script lang="ts" setup>
import { AuditStatus } from "../../../types";
import { pluralize } from "../../../utils";
import NoAudit from "./NoAudit.vue";
import AuditRow from "./AuditRow.vue";

defineProps<{
  audits: string[];
  status: AuditStatus.IN_PROGRESS | AuditStatus.COMPLETED;
  noAuditLabel: string;
}>();
</script>

<template>
  <div>
    <h2 class="fr-text--lg fr-text--regular fr-mb-2w sub-heading">
      {{
        status === AuditStatus.IN_PROGRESS
          ? `En cours (${audits.length})`
          : `${pluralize("Terminé", "Terminés", audits.length)} (${
              audits.length
            })`
      }}
    </h2>

    <template v-if="audits.length">
      <div class="fr-mb-1w headers">
        <!-- TODO: a11y announce column in row elements ("Nom de l’audit : <auditName>")? -->
        <p aria-hidden="true" class="fr-text--sm fr-text--bold fr-mb-0">
          Nom de l’audit
        </p>
        <p aria-hidden="true" class="fr-text--sm fr-text--bold fr-mb-0">
          Statut
        </p>
        <p aria-hidden="true" class="fr-text--sm fr-text--bold fr-mb-0">
          Créé le
        </p>
        <p aria-hidden="true" class="fr-text--sm fr-text--bold fr-mb-0">
          Type d’audit
        </p>
        <p aria-hidden="true" class="fr-text--sm fr-text--bold fr-mb-0">
          Taux de conformité
        </p>
      </div>

      <div>
        <AuditRow
          v-for="(audit, i) in audits"
          :key="i"
          class="audit-row"
          :status="status"
        />
      </div>
    </template>

    <NoAudit v-else :label="noAuditLabel" />
  </div>
</template>

<style scoped>
.sub-heading {
  color: var(--text-mention-grey);
}

.headers {
  display: grid;
  grid-template-columns: 2fr 0.75fr 0.75fr 1.25fr 1.5fr 1.5fr 1fr;
  grid-gap: 1rem;
}

.audit-row + .audit-row {
  margin-top: 1.5rem;
}
</style>
