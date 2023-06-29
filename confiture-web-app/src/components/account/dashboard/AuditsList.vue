<script lang="ts" setup>
import { AuditStatus } from "../../../types";
import { pluralize } from "../../../utils";
import NoAudit from "./NoAudit.vue";

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
    <div v-if="audits.length">Audits...</div>
    <NoAudit v-else :label="noAuditLabel" />
  </div>
</template>

<style scoped>
.sub-heading {
  color: var(--text-mention-grey);
}
</style>
