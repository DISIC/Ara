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
    :class="[
      'card',
      {
        'card--disabled': disabled,
        'card--minimal': minimal,
        'card--with-unit': !!unit
      }
    ]"
  >
    <p
      :class="`fr-m-0 card-metric card-metric--${theme}`"
      :aria-hidden="disabled ? true : undefined"
    >
      <template v-if="disabled">–</template>
      <span v-else>
        {{ value }}<span v-if="unit" class="card-unit">&nbsp;{{ unit }}</span>
      </span>
    </p>
    <div :class="['card-info', { 'fr-py-3v fr-pl-2w': minimal }]">
      <p class="fr-text--bold fr-mb-0 card-title" v-html="title" />
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
  display: grid;
  grid-template-columns: 7.5rem 1fr;
  border: 1px solid var(--border-default-grey);

  @media (width < 62rem) {
    grid-template-columns: 7rem 1fr;
  }
}

.card--with-unit {
  grid-template-columns: 8.25rem 1fr;

  @media (width < 62rem) {
    grid-template-columns: 7rem 1fr;
  }
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
  grid-template-columns: 4.5rem auto;

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
  flex-basis: 100%;
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

    &:deep(br) {
      display: none;
    }
  }
}

.card-description {
  color: var(--text-mention-grey);
}
</style>
