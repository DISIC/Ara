<script lang="ts" setup>
import { ref } from "vue";
import { useDevMode } from "../../composables/useDevMode";
import { REQUIRED } from "../../composables/validation";
import { AuditType } from "../../types";
import DsfrFieldWithValidation from "../validation/DsfrFieldWithValidation.vue";
import FieldValidation from "../validation/FieldValidation.vue";
import FormWithValidation from "../validation/form-with-validation/FormWithValidation.vue";
import AuditTypeRadio from "./AuditTypeRadio.vue";

const props = defineProps<{
  auditType: string | null;
  procedureName: string;
}>();

const emit = defineEmits<{
  (e: "submit", payload: { auditType: AuditType; procedureName: string }): void;
}>();

const fullAudit = {
  value: AuditType.FULL,
  goals: [
    "Identifier toutes les erreurs d’accessibilité",
    "Obtenir un taux global de conformité au RGAA ",
    "Générer une déclaration d’accessibilité"
  ],
  documentation:
    "https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/"
};

const partialAudits = [
  {
    value: AuditType.FAST,
    goals: ["Identifier les principales erreurs d’accessibilité"],
    documentation: "https://design.numerique.gouv.fr/outils/audit-rapide/"
  },
  {
    value: AuditType.COMPLEMENTARY,
    goals: ["Approfondir l’audit 25 critères avec 25 critères supplémentaires"],
    documentation:
      "https://design.numerique.gouv.fr/outils/audit-complementaire/"
  }
];

const procedureName = ref(props.auditType ?? "");

const auditType = ref(props.auditType ?? null);

function submitAuditType() {
  emit("submit", {
    auditType: auditType.value as AuditType,
    procedureName: procedureName.value
  });
}

defineExpose({ procedureName, auditType });

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
      Sauf mentions contraires, tous les champs sont obligatoires. Au moins un
      type d’audit doit être selectionné.
    </p>

    <FieldValidation
      v-slot="{ error, focusRef }"
      :value="auditType"
      :validation="[
        REQUIRED('Sélection obligatoire. Choissisez un type d’audit.')
      ]"
    >
      <!-- FIXME: make into a fielset + legend ? -->
      <div
        class="fr-mb-4w fr-input-group"
        :class="{ 'fr-input-group--error': !!error }"
      >
        <h3 class="fr-h6 fr-mb-1w">Audit complet</h3>
        <p class="fr-mb-2w">
          Cet audit permet de mesurer la conformité au RGAA d’un site internet, il
          a une <strong>valeur légale</strong>.
        </p>

        <AuditTypeRadio
          :ref="focusRef"
          v-model="auditType"
          class="fr-mb-3w audit-type"
          :value="fullAudit.value"
          :checked="auditType === fullAudit.value"
          :goals="fullAudit.goals"
          :documentation-link="fullAudit.documentation"
          detailed
          :is-error="!!error"
        />

        <h3 class="fr-h6 fr-mb-1w">Audits partiels</h3>
        <p class="fr-mb-2w">
          Ces audits permettent d’estimer l’accessibilité d’un site internet, ils
          n’ont <strong>pas de valeur légale</strong>.
        </p>
        <div class="partial-audits">
          <AuditTypeRadio
            v-for="type in partialAudits"
            :key="type.value"
            :model-value="auditType"
            class="audit-type"
            :value="type.value"
            :checked="auditType === type.value"
            :goals="type.goals"
            :documentation-link="type.documentation"
            detailed
            :is-error="!!error"
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
      </div>
    </FieldValidation>

    <DsfrFieldWithValidation
      id="procedure-name"
      class="fr-mb-6w"
      label="Nom du site ou du service à auditer"
      hint="Exemples : Service-Public, Demande de permis de conduire"
      required
      :validation="[REQUIRED('Champ obligatoire. Saisissez le nom du site ou du service à auditer.')]"
    />

    <div class="actions">
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
.notice {
  color: var(--text-mention-grey);
}

.partial-audits {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (width < 36rem) {
    grid-template-columns: 1fr;
  }
}

.actions {
  display: flex;
  justify-content: end;
}
</style>
