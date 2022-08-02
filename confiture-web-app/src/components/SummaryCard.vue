<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
  value: number;
  total: number;
  unit?: string;
  danger?: boolean;
}>();
</script>

<template>
  <div class="fr-p-3w card">
    <div :class="['card-donut', { 'is-danger': danger }]">
      <div class="fr-m-0 card-hole">
        <p class="fr-m-0 card-hole-content">
          {{ value }}
          <span v-if="unit" class="fr-h5 fr-mb-0">{{ unit }}</span>
        </p>
      </div>
    </div>
    <div class="card-info">
      <p class="fr-h6 fr-mb-1v card-title">{{ title }}</p>
      <p class="fr-text--xs fr-mb-0 card-description">
        {{ description }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.card {
  border: 1px solid var(--border-default-grey);
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.card-value,
.card-title {
  color: var(--text-title-grey);
}

.card-info {
  flex-grow: 1;
}

.card-description {
  color: var(--text-mention-grey);
}

.card-donut {
  --pie-deg: calc(calc(v-bind(value) * 360deg) / v-bind(total));

  flex-shrink: 0;
  width: 6.25rem;
  height: 6.25rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: conic-gradient(
    var(--background-action-high-blue-france) 0deg var(--pie-deg),
    var(--background-alt-grey) var(--pie-deg) 360deg
  );
}

.is-danger {
  background: conic-gradient(
    var(--red-marianne-main-472) 0deg var(--pie-deg),
    var(--background-action-low-pink-macaron) var(--pie-deg) 360deg
  );
}

.card-hole {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  background: var(--background-default-grey);
  color: var(--text-title-grey);
}

.card-hole-content {
  display: flex;
  align-items: baseline;
  justify-content: center;
  font-size: 2.25rem;
  font-weight: bold;
}

@media (max-width: 992px) {
  .card {
    flex-direction: column;
  }

  .card-info {
    text-align: center;
  }
}
</style>
