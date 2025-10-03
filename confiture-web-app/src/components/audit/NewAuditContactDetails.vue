<script lang="ts" setup>
import { ref } from "vue";

import { useDevMode } from "../../composables/useDevMode";
import {
  EMAIL,
  REQUIRED,
  useFormField,
  validate
} from "../../composables/validation";
import { useAccountStore } from "../../store";
import DsfrField from "../ui/DsfrField.vue";

const props = defineProps<{
  email: string;
  name: string | null;
}>();

const emit = defineEmits<{
  (e: "previous"): void;
  (e: "submit", payload: { auditorEmail: string; auditorName: string }): void;
}>();

const accountStore = useAccountStore();

const nameValue = ref(props.name ?? "");

const email = useFormField(props.email ?? "", [
  REQUIRED("Champ obligatoire. Saisissez votre adresse e-mail."),
  EMAIL("Format incorrect. Utilisez le format : nom@domaine.fr.")
]);

function submitAuditContactDetails() {
  if (!validate(email)) {
    return;
  }
  emit("submit", {
    auditorEmail: email.value.value,
    auditorName: nameValue.value
  });
}

function goToPreviousStep() {
  emit("previous");
}

// Dev mode
const isDevMode = useDevMode();

function fillSettings() {
  email.value.value =
    accountStore.account?.email ?? "etienne-dupont@example.com";
  nameValue.value = "Etienne Dupont";
}
</script>

<template>
  <form novalidate @submit.prevent="submitAuditContactDetails">
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
        :ref="email.refFn"
        :model-value="email.value.value"
        class="fr-mb-2w"
        label="Adresse e-mail"
        type="email"
        required
        :error="email.error.value"
        @update:model-value="email.value.value = $event"
      >
        <template #hint>
          Permet de vous envoyer le lien d'accès à l’audit et aux livrables.<br />Format attendu : nom@domaine.fr
        </template>
      </DsfrField>

      <DsfrField
        v-if="!accountStore.account?.name"
        id="procedure-auditor-name"
        v-model="nameValue"
        class="fr-mb-6w"
        label="Prénom et nom (optionnel)"
        hint="Sera affiché dans le rapport d’audit pour permettre à la personne qui a demandé l’audit de vous identifier en cas de question."
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
      <button type="submit" class="fr-btn fr-btn--icon-left fr-icon-check-line">
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
