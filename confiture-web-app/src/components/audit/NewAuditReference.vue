<script lang="ts" setup>
import { ref } from "vue";
import { AuditReference } from "../../types/index.js";
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
</script>
<template>
  <FormWithValidation @submit="submitAuditReference">

    <div>
      <h3>RGAA 4</h3>
      <p>Version <span class="fr-text--bold">en vigueur et référence réglementaire.</span></p>

      <div class="audit-reference-radios">
        <AuditReferenceRadio
          v-model="auditReference"
          :value="AuditReference.RGAA_4"
          :checked="auditReference === AuditReference.RGAA_4"
        />
      </div>
    </div>

    <div>
      <h3>RGAA 5&nbsp;<span class="fr-badge fr-badge--sm fr-badge--info fr-badge--no-icon">bêta</span></h3>

      <p>Version <span class="fr-text--bold">utilisable dès maintenant,</span> mais pas encore en vigueur. Entrera en vigueur par décret en 2027.</p>

      <div class="audit-reference-radios">
        <AuditReferenceRadio
          v-model="auditReference"
          :value="AuditReference.RGAA_5_Web"
          :checked="auditReference === AuditReference.RGAA_5_Web"
        />

        <AuditReferenceRadio
          v-model="auditReference"
          :value="AuditReference.RGAA_5_Mobile"
          :checked="auditReference === AuditReference.RGAA_5_Mobile"
        />

        <AuditReferenceRadio
          v-model="auditReference"
          :value="AuditReference.RGAA_5_Document"
          :checked="auditReference === AuditReference.RGAA_5_Document"
        />
      </div>

    </div>

    <p class="fr-text--sm fr-hint-text fr-mb-0">
      <span class="fr-icon-information-line" aria-hidden="true" />
      La version du RGAA ne peut pas être modifiée après la création d'un audit.
    </p>

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
  margin-bottom: 4rem;

  @media (width < 36rem) {
    grid-template-columns: 1fr;
  }
}
</style>
