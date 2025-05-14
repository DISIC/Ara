<script lang="ts" setup>
defineProps<{
  value: number;
  total: number;
  unit?: string;
}>();
</script>

<template>
  <div class="card-donut">
    <div class="fr-m-0 card-hole">
      <p class="fr-m-0 card-hole-content">
        {{ value }}
        <span v-if="unit" class="fr-mb-0 card-unit"> {{ unit }}</span>
      </p>
    </div>
  </div>
</template>

<style scoped>
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
    var(--background-active-blue-france) 0deg var(--pie-deg),
    var(--background-contrast-info) var(--pie-deg) 360deg
  );
}

.card-hole {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80%;
  height: 80%;
  border-radius: 50%;
  background: var(--background-default-grey);
  color: var(--text-title-grey);
}

.card-hole-content {
  display: flex;
  align-items: baseline;
  justify-content: center;
  font-size: 2.25em;
  line-height: 1.5;
  font-weight: bold;
}

.card-unit {
  font-size: 1.375rem;
}
</style>
