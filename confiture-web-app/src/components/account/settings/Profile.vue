<script lang="ts" setup>
import { ref } from "vue";

import DsfrField from "../../DsfrField.vue";

const name = ref("");
const orgName = ref("");
/**
 * TODO: show action when content differs from store
 */
const showActions = ref(true);
</script>

<template>
  <div class="wrapper">
    <h2 class="fr-h6">Profil</h2>
    <DsfrField id="name" label="Prénom et nom" :model-value="name" />
    <DsfrField
      id="org-name"
      label="Nom de la structure"
      :model-value="orgName"
    />
    <ul
      v-if="showActions"
      class="fr-btns-group fr-btns-group--inline fr-btns-group--right"
    >
      <li>
        <button class="fr-btn fr-btn--secondary fr-mb-3w">Annuler</button>
      </li>
      <li><button class="fr-btn fr-mb-3w">Mettre à jour</button></li>
    </ul>
  </div>
</template>

<style scoped>
.wrapper {
  max-width: 30rem;
}
</style>
