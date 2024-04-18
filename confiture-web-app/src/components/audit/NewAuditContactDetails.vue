<script lang="ts" setup>
import { ref } from "vue";
import DsfrField from "../ui/DsfrField.vue";

const emit = defineEmits<{
  (e: "previous"): void;
  (e: "submit", payload: { email: string; name: string }): void;
}>();

const email = ref("");
const name = ref("");

function submitAuditContactDetails() {
  emit("submit", {
    email: email.value,
    name: name.value
  });
}

function goToPreviousStep() {
  emit("previous");
}
</script>

<template>
  <form @submit.prevent="submitAuditContactDetails">
    <div class="content">
      <p class="fr-text--sm notice">
        Sauf mentions contraires, tous les champs sont obligatoires.
      </p>

      <DsfrField
        id="procedure-auditor-email"
        v-model="email"
        class="fr-mb-2w"
        label="Adresse e-mail"
        type="email"
        required
      >
        <template #hint>
          Permet de vous envoyer les liens de l’audit et du rapport d’audit.<br />Au
          format : prenom@domaine.fr
        </template>
      </DsfrField>

      <DsfrField
        id="procedure-auditor-name"
        v-model="name"
        class="fr-mb-6w"
        label="Prénom et nom (optionnel)"
        hint="Sera affiché dans le rappport de l’audit pour aider le demandeur de l’audit à vous identifier s’il a des questions ou besoin d’aide."
      />
    </div>

    <div class="actions">
      <button
        type="button"
        class="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-arrow-left-s-line"
        @click="goToPreviousStep"
      >
        Étape précédente
      </button>
      <button
        type="submit"
        class="fr-btn fr-btn--icon-right fr-icon-arrow-right-s-line"
      >
        Étape suivante
      </button>
    </div>
  </form>
</template>

<style scoped>
.notice {
  color: var(--text-mention-grey);
}

.content {
  max-width: 30rem;
}

.actions {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}
</style>
