<script setup lang="ts">
defineProps<{
  auditName: string;
  auditType: string;
  auditRisk: string;
  auditComplianceLevel: number;
}>();

defineEmits(["validate"]);

// TODO: handle options dropdown
function openOptions() {
  console.log("openOptions");
}
</script>

<template>
  <p class="fr-badge fr-badge--purple-glycine fr-mb-1v">🔍 Audit en cours</p>
  <div class="fr-mb-3w heading">
    <h1 class="fr-mb-0">{{ auditName }}</h1>
    <ul class="fr-btns-group fr-btns-group--inline fr-btns-group--icon-right">
      <li>
        <button
          class="fr-btn fr-btn--secondary fr-icon-arrow-down-s-line fr-btn--icon-right"
          @click="openOptions"
        >
          Options
        </button>
      </li>
      <li>
        <button class="fr-btn" @click="$emit('validate')">
          Valider l’audit
        </button>
      </li>
    </ul>
  </div>

  <dl class="fr-grid-row fr-grid-row--gutters fr-mb-3v">
    <div class="fr-col-12 fr-col-md-4">
      <div class="fr-px-3w fr-py-3v info">
        <dt class="fr-text--xs fr-m-0 fr-text--bold info-label">
          Type d’audit
        </dt>
        <dd class="fr-m-0 fr-h3 info-value">{{ auditType.toLowerCase() }}</dd>
      </div>
    </div>
    <div class="fr-col-12 fr-col-md-4">
      <div class="fr-px-3w fr-py-3v info">
        <dt class="fr-text--xs fr-m-0 fr-text--bold info-label">
          Risque de l’audit
        </dt>
        <dd class="fr-m-0 fr-h3 info-value">{{ auditRisk }}</dd>
      </div>
    </div>
    <div class="fr-col-12 fr-col-md-4">
      <div class="fr-px-3w fr-py-3v info">
        <dt class="fr-text--xs fr-m-0 fr-text--bold info-label">
          Taux de conformité au RGAA actuel
        </dt>
        <dd class="fr-m-0 fr-h3 info-value">
          {{ auditComplianceLevel }}&nbsp;<span class="fr-text--md">%</span>
        </dd>
      </div>
    </div>
  </dl>

  <p class="fr-text--sm fr-mb-6w mandatory-notice">
    Sauf mention contraire, tous les champs sont obligatoires.
  </p>
</template>

<style scoped>
.heading {
  align-items: center;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.info {
  border: 1px solid var(--border-default-grey);
}

.info-value {
  text-transform: capitalize;
}

.info-label {
  color: var(--text-mention-grey);
}

.mandatory-notice {
  color: var(--text-mention-grey);
}
</style>
