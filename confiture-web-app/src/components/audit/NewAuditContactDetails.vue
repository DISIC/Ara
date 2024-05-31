<script lang="ts" setup>
import { ref } from "vue";
import DsfrField from "../ui/DsfrField.vue";
import { useDevMode } from "../../composables/useDevMode";
import { useAccountStore } from "../../store";

const props = defineProps<{
  email: string;
  name: string | null;
}>();

const emit = defineEmits<{
  (e: "previous"): void;
  (e: "submit", payload: { auditorEmail: string; auditorName: string }): void;
}>();

const accountStore = useAccountStore();

const emailValue = ref(props.email ?? "");
const nameValue = ref(props.name ?? "");

function submitAuditContactDetails() {
  emit("submit", {
    auditorEmail: emailValue.value,
    auditorName: nameValue.value
  });
}

function goToPreviousStep() {
  emit("previous");
}

// Dev mode
const isDevMode = useDevMode();

function fillSettings() {
  emailValue.value = "etienne-dupont@example.com";
  nameValue.value = "Etienne Dupont";
}
</script>

<template>
  <form @submit.prevent="submitAuditContactDetails">
    <div class="content">
      <div v-if="isDevMode" class="fr-mb-4w">
        <button class="fr-btn" type="button" @click="fillSettings">
          [DEV] Remplir les paramètres
        </button>
      </div>

      <p class="fr-text--sm notice">
        Sauf mentions contraires, tous les champs sont obligatoires.
      </p>

      <DsfrField
        v-if="!accountStore.account"
        id="procedure-auditor-email"
        v-model="emailValue"
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
        v-if="!accountStore.account?.name"
        id="procedure-auditor-name"
        v-model="nameValue"
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
        Valider les paramètres
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
