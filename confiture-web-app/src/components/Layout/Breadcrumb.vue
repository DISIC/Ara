<script setup lang="ts">
import type { RouteParams } from "vue-router";

defineProps<{
  links: { label: string; name: string; params: RouteParams }[];
}>();
</script>

<template>
  <nav role="navigation" class="fr-breadcrumb" aria-label="vous êtes ici :">
    <button
      class="fr-breadcrumb__button"
      aria-expanded="false"
      aria-controls="breadcrumb"
    >
      Voir le fil d’Ariane
    </button>
    <div id="breadcrumb" class="fr-collapse">
      <ol class="fr-breadcrumb__list">
        <li v-for="(link, i) in links" :key="i">
          <RouterLink
            class="fr-breadcrumb__link"
            :to="{ name: link.name, params: link.params }"
            :aria-current="i === links.length + 1 ? 'page' : null"
            >{{ link.label }}</RouterLink
          >
        </li>
      </ol>
    </div>
  </nav>
</template>
