<script lang="ts" setup>
import { computed } from "vue";

import { AuditStatus } from "../../../types";
import { formatDate } from "../../../utils";

// TODO: plug everything
const props = defineProps<{
  status: AuditStatus.IN_PROGRESS | AuditStatus.COMPLETED;
}>();

const complianceLevel = Math.round(Math.random() * 100);

const isInProgress = computed(() => props.status === AuditStatus.IN_PROGRESS);
</script>

<template>
  <div class="fr-py-2w grid">
    <RouterLink to="#" class="fr-pl-2w audit-name">
      <strong>Audit Système de Design de l’État</strong>
    </RouterLink>

    <p
      class="fr-badge fr-badge--sm audit-status"
      :class="{
        'fr-badge--purple-glycine': isInProgress,
      }"
    >
      {{ isInProgress ? "En cours" : "Terminé" }}
    </p>
    <p class="fr-mb-0 audit-date">
      <time :datetime="new Date().toString()">
        {{ formatDate(new Date().toString()) }}
      </time>
    </p>
    <p class="fr-mb-0 audit-type">Complémentaire</p>
    <div class="audit-compliance-level">
      <p
        class="fr-badge fr-badge--sm fr-badge--no-icon fr-mb-0"
        :class="
          !isInProgress
            ? {
                'fr-badge--green-emeraude': complianceLevel === 100,
                'fr-badge--new': complianceLevel >= 50,
                'fr-badge--error': complianceLevel < 50,
              }
            : null
        "
      >
        {{ isInProgress ? "-" : `${complianceLevel}%` }}
      </p>
      <p class="fr-text--xs fr-mb-0 fr-mt-1v">
        {{
          complianceLevel === 100
            ? "Totalement conforme"
            : complianceLevel >= 50
            ? "Partiellement conforme"
            : "Non conforme"
        }}
      </p>
    </div>
    <RouterLink
      :to="{ name: isInProgress ? '' : '' }"
      class="fr-btn fr-btn--secondary fr-btn--icon-left"
      :class="isInProgress ? 'fr-icon-edit-line' : 'fr-icon-eye-line'"
    >
      {{ isInProgress ? "Finaliser l’audit" : "Voir le rapport" }}
    </RouterLink>
    <div></div>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: 2fr 0.75fr 0.75fr 1.25fr 1.5fr 1.5fr 1fr;
  grid-gap: 1rem;
  align-items: center;
  border: 1px solid var(--border-default-grey);
  position: relative;
}

.audit-name {
  background-image: none;
  z-index: 1;
}

.audit-name:focus {
  outline: none;
}
.audit-name:focus::before {
  outline: 2px solid #0a76f6;
}

.audit-name:hover::before {
  background-color: var(--background-raised-grey-hover);
}

.audit-name::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
}

.audit-status,
.audit-date,
.audit-type,
.audit-compliance-level {
  pointer-events: none;
  z-index: 1;
}
</style>
