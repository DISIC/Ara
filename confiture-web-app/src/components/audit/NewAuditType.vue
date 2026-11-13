<script lang="ts" setup>
import { ref } from "vue";
import { useDevMode } from "../../composables/useDevMode";
import { REQUIRED } from "../../composables/validation";
import { AuditReference, AuditType } from "../../types";
import DsfrFieldWithValidation from "../validation/DsfrFieldWithValidation.vue";
import FieldValidation from "../validation/FieldValidation.vue";
import FormWithValidation from "../validation/form-with-validation/FormWithValidation.vue";
import AuditTypeRadio from "./AuditTypeRadio.vue";

const props = defineProps<{
  auditType: string | null;
  auditReference: AuditReference | null;
  procedureName: string;
}>();

const emit = defineEmits<{
  (e: "previous"): void;
  (e: "submit", payload: { auditType: AuditType; procedureName: string }): void;
}>();

const procedureName = ref(props.procedureName ?? "");

const auditType = ref(props.auditType ?? null);

const auditReference = ref(props.auditReference ?? null);

const fullAudit = {
  value: AuditType.FULL,
  tag: "Valeur légale",
  label: "Pour mesurer la conformité au RGAA",
  goals: [
    "Identifier toutes les erreurs d’accessibilité",
    "Obtenir un taux global de conformité au RGAA ",
    "Générer une déclaration d’accessibilité"
  ],
  documentation:
    "https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/"
};

const partialAudit = {
  value: AuditType.FAST,
  tag: auditReference.value === AuditReference.RGAA_4 ? "" : "Bêta",
  label: "Pour estimer le niveau d'accessibilité",
  goals: ["Identifier les principales erreurs d’accessibilité"],
  documentation: "https://design.numerique.gouv.fr/outils/audit-rapide/"
};

function submitAuditType() {
  emit("submit", {
    auditType: auditType.value as AuditType,
    procedureName: procedureName.value
  });
}

function goToPreviousStep() {
  emit("previous");
}

defineExpose({ procedureName, auditReference, auditType });

// Dev mode
const isDevMode = useDevMode();

function fillSettings() {
  auditType.value = AuditType.FULL;
  procedureName.value = "Ma procédure";
}
</script>

<template>
  <FormWithValidation @submit="submitAuditType">
    <div v-if="isDevMode" class="fr-mb-4w">
      <button class="fr-btn" type="button" @click="fillSettings">
        [DEV] Remplir les paramètres
      </button>
    </div>

    <p class="fr-text--sm notice">
      Tous les champs sont obligatoires.
    </p>

    <FieldValidation
      v-slot="{ error, focusRef }"
      :value="auditType"
      :validation="[
        REQUIRED('Sélection obligatoire. Choissisez un type d’audit.')
      ]"
    >
      <div
        class="fr-mb-4w fr-input-group audit-type-radios"
        :class="{ 'fr-input-group--error': !!error }"
      >

        <AuditTypeRadio
          :ref="focusRef"
          v-model="auditType"
          :value="fullAudit.value"
          :checked="auditType === fullAudit.value"
          :goals="fullAudit.goals"
          :documentation-link="fullAudit.documentation"
          :is-error="!!error"
          :tag="fullAudit.tag"
          :label="fullAudit.label"
        />

        <AuditTypeRadio
          :key="partialAudit.value"
          :model-value="auditType"
          :value="partialAudit.value"
          :checked="auditType === partialAudit.value"
          :goals="partialAudit.goals"
          :documentation-link="partialAudit.documentation"
          :is-error="!!error"
          :tag="partialAudit.tag"
          :label="partialAudit.label"
          @update:model-value="auditType = $event"
        />
      </div>

      <p
        v-if="error"
        id="audit-type-error"
        class="fr-error-text"
      >
        {{ error }}
      </p>

    </FieldValidation>

    <DsfrFieldWithValidation
      id="procedure-name"
      v-model="procedureName"
      class="fr-mb-6w"
      label="Nom du site ou du service à auditer"
      hint="Exemples : Service-Public, Demande de permis de conduire"
      required
      :validation="[REQUIRED('Champ obligatoire. Saisissez le nom du site ou du service à auditer.')]"
    />

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
  </FormWithValidation>
</template>

<style scoped>
.audit-type-radios {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 1rem;

  @media (width < 36rem) {
    grid-template-columns: 1fr;
  }
}

.notice {
  color: var(--text-mention-grey);
}

.actions {
  display: flex;
  justify-content: space-between;
}
</style>
