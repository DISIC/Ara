<script setup lang="ts">
import { RouteLocationRaw } from "vue-router";

defineProps<{
  label: string;
  to: RouteLocationRaw;
}>();
</script>

<template>
  <div class="fr-mb-4w">
    <RouterLink
      class="fr-link fr-icon-arrow-left-line fr-link--icon-left"
      :to="to"
    >
      {{ label }}
    </RouterLink>
  </div>
</template>
