<script setup lang="ts">
import elementForm from "@gouvfr/dsfr/dist/artwork/pictograms/document/document.svg?no-inline";
import { computed, ref } from "vue";
import { AuditReference } from "../../types";
import DsfrArtwork from "../ui/DsfrArtwork.vue";

const props = defineProps<{
  value: AuditReference;
  checked: boolean;
  modelValue: AuditReference | null;
  isError?: boolean;
}>();

defineEmits(["update:modelValue"]);

const inputRef = ref<HTMLInputElement>();

defineExpose({
  inputRef,
  focus() {
    inputRef.value?.focus();
  }
});

const radios = [
  {
    reference: AuditReference.RGAA_4,
    label: "Web",
    description: `<span class="fr-text--bold">Site consulté dans un navigateur</span> sur ordinateur, mobile ou tablette.`,
    disabled: false,
    icon: elementForm
  },
  {
    reference: AuditReference.RGAA_5_Web,
    label: "Web",
    description: `<span class="fr-text--bold">Site consulté dans un navigateur</span> sur ordinateur, mobile ou tablette.`,
    disabled: false,
    icon: elementForm
  },
  {
    reference: AuditReference.RGAA_5_Mobile,
    label: "App. mobile",
    description: `<span class="fr-text--bold">Application installée</span> sur mobile ou tablette.`,
    disabled: false,
    icon: elementForm
  },
  {
    reference: AuditReference.RGAA_5_Document,
    label: "Bureautique",
    description: `<span class="fr-text--bold">Document bureautique :</span> texte, tableur, présentation, PDF, etc. Exception : les formulaires PDF.`,
    disabled: true,
    icon: elementForm
  }
];

const currentRadioReference: any = computed(() =>
  radios.find(x => x.reference === props.value));

const isDisabled = computed(() =>
  currentRadioReference.value.disabled === true);
</script>

<template>
  <div :class="['fr-p-3w wrapper', { 'checked': checked, 'is-error': isError, 'is-disabled': isDisabled }]">

    <div class="radio-header">
      <span v-if="isDisabled" class="fr-badge fr-badge--sm fr-badge--info fr-badge--no-icon">à venir</span>

      <DsfrArtwork :file-path="currentRadioReference.icon" class="checkbox-artwork" />

    </div>

    <div class="radio-body">
      <div class="radio-layer" @click="!isDisabled && $emit('update:modelValue', value)" />

      <div class="fr-radio-group fr-radio-group--sm">
        <input
          :id="`audit-reference-${value}`"
          ref="inputRef"
          class="radio-input"
          type="radio"
          name="audit-reference"
          :value="value"
          :checked="value === modelValue"
          required
          :aria-describedby="`audit-reference-description-${value}`"
          :disabled="isDisabled"
          @change="
            $emit('update:modelValue', ($event.target as HTMLInputElement).value)
          "
        />

        <label class="fr-label radio-label fr-h4 fr-mb-3w">{{ currentRadioReference.label }}</label>

        <p :id="`audit-reference-description-${value}`" v-html="currentRadioReference.description"></p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  position: relative;
  border: 1px solid var(--border-default-grey);
}

.wrapper:not(.is-disabled):hover {
  background-color: var(--background-default-grey-hover);
}

.wrapper:not(.is-disabled).checked {
  --border-default-grey: var(--border-plain-blue-france);
}

.radio-layer {
  position: absolute;
  inset: 0;
  cursor: pointer;
}

.is-disabled .radio-layer {
  cursor: not-allowed;
}

.is-error .radio-label {
  color: var(--text-default-error);
}

.radio-input {
  /* When the browser scrolls to the required input from the bottom of the form, show the entire "radio block" */
  scroll-margin-top: 6rem;
}

/* Override DSFR radio input position to align with a larger label */
.fr-radio-group--sm input[type="radio"] + label {
  background-position:
    0 0.5rem,
    0 0.5rem !important;
}

.fr-radio-group--sm input[type="radio"] + label::before {
  top: 0.5rem;
}
</style>
