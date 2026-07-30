<script setup lang="ts">
// component for page /audits/:auditId/pages/:pageSlug/criteria/:criterion

import { useRouteParams } from "@vueuse/router";
import { useTestItems } from "../../composables/useTestItems";

const auditId = useRouteParams("auditId");
const pageSlug = useRouteParams("pageSlug");
const criterion = useRouteParams("criterion");

const testItems = useTestItems([auditId, pageSlug, criterion], {
  onCreated(createdItem) {
    // move focus to the title field of the newly created item
  },
  onDeleted(deletedItem) {
    // move focus the previous item in the list
  }
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

        <!-- Update (TODO: dont plug directly to item ?) -->
        <input
          v-model="item.title"
          type="text"
          @input="testItems.update(item.id, { title: $event.target?.value })"
        />
        <input
          v-model="item.description"
          type="text"
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
