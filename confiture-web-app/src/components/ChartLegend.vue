<template>
  <div class="fr-py-5v" aria-hidden="true">
    <div class="fr-mb-2w fr-text--xs legend-title">Légende</div>

    <div class="fr-text--sm fr-text--bold fr-mb-1v legend-item">
      <div class="fr-mr-1w legend-color compliant" />
      Conforme
    </div>
    <div class="fr-text--sm fr-text--bold fr-mb-1v legend-item">
      <div class="fr-mr-1w legend-color not-compliant" />
      Non conforme
    </div>
    <div class="fr-text--sm fr-text--bold legend-item">
      <div class="fr-mr-1w legend-color not-applicable" />
      Non applicable
    </div>
  </div>
</template>

<style scoped>
.legend-title {
  color: var(--text-mention-grey);
}
.legend-item {
  align-items: center;
  display: flex;
}

.legend-color {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-color.compliant {
  background-color: var(--background-action-high-success);
}
.legend-color.not-compliant {
  background-color: var(--background-action-high-error);
}
.legend-color.not-applicable {
  background-color: var(--background-contrast-grey);
}
</style>
