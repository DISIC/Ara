<script lang="ts">
export enum SummaryCardThemes {
  Blue = "blue",
  Red = "red",
  Green = "green"
}
</script>

<script setup lang="ts">
defineProps<{
  title: string;
  description?: string;
  value: number;
  unit?: string;
  theme?: SummaryCardThemes;
  disabled?: boolean;
  minimal?: boolean;
}>();
</script>

<template>
  <div
    :class="['card', { 'card--disabled': disabled, 'card--minimal': minimal }]"
  >
    <p
      :class="`fr-m-0 fr-px-3w card-metric card-metric--${theme}`"
      :aria-hidden="disabled ? true : undefined"
    >
      <template v-if="disabled">–</template>
      <span v-else>
        {{ value }}<span v-if="unit" class="card-unit">{{ unit }}</span>
      </span>
    </p>
    <div :class="['card-info', { 'fr-py-3v fr-pl-2w': minimal }]">
      <p class="fr-text--bold fr-mb-0 card-title">{{ title }}</p>
      <p
        v-if="description"
        class="fr-text--xs fr-mb-0 fr-mt-1w card-description"
      >
        {{ description }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.card {
  display: flex;
  border: 1px solid var(--border-default-grey);
}

.card--disabled {
  .card-metric {
    --card-metric-color: var(--text-disabled-grey);
    --card-metric-bg-color: var(--background-disabled-grey);
  }

  .card-title {
    color: var(--text-disabled-grey);
  }
}

.card--minimal {
  grid-template-columns: 4rem auto;

  .card-metric {
    font-size: 1.75rem;
  }

  .card-title {
    font-size: 1rem;
  }

  .card-unit {
    font-size: 1rem;
  }
}

.card-metric {
  background-color: var(--card-metric-bg-color);
  color: var(--card-metric-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3.375rem;
  font-weight: bold;
  font-variant-numeric: tabular-nums;
  line-height: 1;

  @media (width < 62rem) {
    font-size: 2.5rem;
  }
}

.card-metric--green {
  --card-metric-color: var(--text-default-success);
  --card-metric-bg-color: var(--background-contrast-green-emeraude);
}

.card-metric--blue {
  --card-metric-color: var(--text-active-blue-france);
  --card-metric-bg-color: var(--background-contrast-blue-france);
}

.card-metric--red {
  --card-metric-color: var(--text-default-error);
  --card-metric-bg-color: var(--background-contrast-error);
}

.card-unit {
  font-size: 1.5rem;
  line-height: 1;
}

.card-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 1.5rem 0.75rem 1.5rem 1.5rem;

  @media (width < 62rem) {
    padding: 0.75rem 1rem;
  }
}

.card-title {
  font-size: 1.25rem;
  line-height: 1.3;

  @media (width < 62rem) {
    font-size: 1.125rem;
  }
}

.card-description {
  color: var(--text-mention-grey);
}
</style>
