<script lang="ts" setup>
import { slugify } from "../utils";

defineProps<{ title: string }>();
</script>

<template>
  <div class="card">
    <div class="fr-py-5v fr-px-2w card-header">
      <h3 :id="slugify(title)" class="fr-h4 fr-m-0">{{ title }}</h3>
    </div>

    <div class="fr-px-4v content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.card {
  border: 1px solid var(--border-default-grey);
}

.card-header {
  border-bottom: 1px solid var(--border-default-grey);
}
</style>
