<script lang="ts" setup>
import { ref } from "vue";
import { REQUIRED } from "../../composables/validation.js";
import { AuditReference } from "../../types/index.js";
import FieldValidation from "../validation/FieldValidation.vue";
import FormWithValidation from "../validation/form-with-validation/FormWithValidation.vue";
import AuditReferenceRadio from "./AuditReferenceRadio.vue";

const props = defineProps<{
  auditReference: AuditReference | null;
}>();

const auditReference = ref(props.auditReference ?? null);

const emit = defineEmits<{
  (e: "submit", payload: { auditReference: AuditReference }): void;
}>();

function submitAuditReference() {
  emit("submit", {
    auditReference: auditReference.value as AuditReference
  });
}

defineExpose({ auditReference });
</script>
<template>
  <FormWithValidation @submit="submitAuditReference">

    <FieldValidation
      v-slot="{ error, focusRef }"
      :value="auditReference"
      :validation="[REQUIRED('Sélection obligatoire. Choissisez un référentiel.')]"
    >

      <div
        class="fr-mb-4w fr-input-group"
        :class="{ 'fr-input-group--error': !!error }"
      >
        <h3>RGAA 4</h3>
        <p>Version <span class="fr-text--bold">en vigueur et référence réglementaire.</span></p>

        <div class="audit-reference-radios">
          <AuditReferenceRadio
            :ref="focusRef"
            v-model="auditReference"
            :value="AuditReference.RGAA_4"
            :checked="auditReference === AuditReference.RGAA_4"
          />
        </div>

        <h3 class="fr-mt-4w">RGAA 5&nbsp;<span class="fr-badge fr-badge--sm fr-badge--info fr-badge--no-icon">bêta</span></h3>

        <p>Version <span class="fr-text--bold">utilisable dès maintenant,</span> mais pas encore en vigueur. Entrera en vigueur par décret en 2027.</p>

        <div class="audit-reference-radios">
          <AuditReferenceRadio
            ref="auditReferenceRgaa5Web"
            v-model="auditReference"
            :value="AuditReference.RGAA_5_Web"
            :checked="auditReference === AuditReference.RGAA_5_Web"
          />

          <AuditReferenceRadio
            ref="auditReferenceRgaa5Mobile"
            v-model="auditReference"
            :value="AuditReference.RGAA_5_Mobile"
            :checked="auditReference === AuditReference.RGAA_5_Mobile"
          />

          <AuditReferenceRadio
            ref="auditReferenceRgaa5Document"
            v-model="auditReference"
            :value="AuditReference.RGAA_5_Document"
            :checked="auditReference === AuditReference.RGAA_5_Document"
          />
        </div>
        <p
          v-if="error"
          id="audit-reference-error"
          class="fr-error-text"
        >
          {{ error }}
        </p>

      </div>
    </FieldValidation>

    <p class="fr-text--sm fr-hint-text fr-mb-0">
      <span class="fr-icon-information-line" aria-hidden="true" />
      La version du RGAA ne peut pas être modifiée après la création d'un audit.
    </p>

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
h3 > span {
  vertical-align: middle;
}

.audit-reference-radios {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;

  @media (width < 36rem) {
    grid-template-columns: 1fr;
  }
}

.actions {
  margin-top: 2rem;
  display: flex;
  justify-content: right;
}
</style>
