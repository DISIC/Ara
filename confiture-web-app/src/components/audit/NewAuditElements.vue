<script lang="ts" setup>
import { useAccountStore } from "../../store";

const emit = defineEmits<{
  (e: "previous"): void;
  (e: "submit", payload: { pages: [] }): void;
}>();

const accountStore = useAccountStore();

function goToPreviousStep() {
  emit("previous");
}

function submitAuditElements() {
  emit("submit", { pages: [] });
}
</script>

<template>
  <form @submit.prevent="submitAuditElements">
    <div class="fr-mb-6w wrapper">
      <p class="fr-mb-1w">Le site ou service à auditer contient :</p>

      <p class="fr-text--xs fr-mb-2w notice">
        Votre sélection rendra certaines thématiques de l’audit non applicables
        sur toutes les pages de votre échantillon. Vous pourrez modifier votre
        choix à tout moment.
      </p>
    </div>

    <div class="actions">
      <button
        type="button"
        class="fr-btn fr-btn--tertiary fr-btn--icon-left fr-icon-arrow-left-s-line action-previous"
        @click="goToPreviousStep"
      >
        Étape précédente
      </button>

      <button type="submit" class="fr-btn fr-btn--secondary">
        Ignorer cette étape
      </button>

      <button
        v-if="accountStore.account && accountStore.account.name"
        type="submit"
        class="fr-btn fr-btn--icon-left fr-icon-check-line"
      >
        Valider les paramètres
      </button>

      <button
        v-else
        type="submit"
        class="fr-btn fr-btn--icon-right fr-icon-arrow-right-s-line"
      >
        Étape suivante
      </button>
    </div>
  </form>
</template>

<style scoped>
.wrapper {
  max-width: 30rem;
  margin: 0 auto;
}

.notice {
  color: var(--text-mention-grey);
}

.actions {
  display: flex;
  justify-content: end;
  gap: 1rem;

  .action-previous {
    margin-inline-end: auto;
  }
}
</style>
