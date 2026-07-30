<script setup lang="ts">
// component for page /audits/:auditId/pages/:pageSlug/criteria/:criterion

import { useRouteParams } from "@vueuse/router";
import { useTestItems } from "../../composables/useTestItems";

const auditId = useRouteParams("auditId");
const pageSlug = useRouteParams("pageSlug");
const criterion = useRouteParams("criterion");

// if any of the params changes, the data is invalidated and a new fetch is triggered
const testItems = useTestItems([auditId, pageSlug, criterion], {
  onCreated(createdItem) {
    // move focus to the title field of the newly created item
  },
  onDeleted(deletedItem) {
    // move focus the previous item in the list
  },
  // show a confirm modal before deleting an item
  confirmDelete: true
});
</script>

<template>
  <div v-if="testItems.isLoading">
    Chargement...
    <!-- Show a skeleton ? -->
  </div>

  <template v-else>
    <ul>
      <li v-for="item, in testItems.data.value" :key="item.id">

        <input
          :value="item.title"
          @input="testItems.update(item.id, { title: $event.target?.value })"
        />
        <textarea
          :value="item.description"
          @input="testItems.update(item.id, { description: $event.target?.value })"
        />

        <!-- Delete -->
        <button @click="testItems.delete(item.id)">Supprimer</button>
      </li>
    </ul>

    <!-- Create -->
    <button @click="testItems.create()">
      Ajouter un test item
    </button>
  </template>
</template>
