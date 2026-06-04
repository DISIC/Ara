<script lang="ts" setup>
import { computed, onMounted, ref, watch } from "vue";

import { useNotifications } from "../../../composables/useNotifications";
import { DEFAULT_NOTIFICATION_ERROR_DESCRIPTION } from "../../../enums";
import { useAccountStore } from "../../../store/account";
import DsfrField from "../../ui/DsfrField.vue";

const accountStore = useAccountStore();
const notify = useNotifications();

const name = ref("");

onMounted(() => {
  name.value = accountStore.account?.name || "";
});

watch(accountStore, () => {
  if (!accountStore.account) {
    return;
  }

  name.value = accountStore.account?.name || "";
});

const nameField = ref<InstanceType<typeof DsfrField>>();

const showActions = computed(() => {
  return (
    name.value !== accountStore.account?.name
  );
});

function updateProfile() {
  accountStore
    .updateProfile({ name: name.value })
    .then(() => {
      notify("success", undefined, "Profil mis à jour avec succès");
    })
    .catch(() => {
      notify(
        "error",
        "Échec de la mise à jour du profil",
        DEFAULT_NOTIFICATION_ERROR_DESCRIPTION
      );
    });
}

function cancelUpdate() {
  name.value = accountStore.account?.name || "";

  nameField.value?.inputRef?.focus();
}
</script>

<template>
  <div class="wrapper">
    <h2 class="fr-h6">Profil</h2>
    <DsfrField id="name" ref="nameField" v-model="name" label="Prénom et nom (optionnel)" hint="Sera affiché dans le rapport d’audit pour permettre à la personne qui a demandé l’audit de vous identifier en cas de question." />
    <ul
      v-if="showActions"
      class="fr-btns-group fr-btns-group--inline fr-btns-group--right"
    >
      <li>
        <button class="fr-btn fr-btn--secondary fr-mb-0" @click="cancelUpdate">
          Annuler
        </button>
      </li>
      <li>
        <button class="fr-btn fr-mb-0" @click="updateProfile">
          Mettre à jour
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.wrapper {
  max-width: 30rem;
}
</style>
