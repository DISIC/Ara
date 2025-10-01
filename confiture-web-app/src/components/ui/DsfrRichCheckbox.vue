<script setup lang="ts">
import DsfrArtwork from "./DsfrArtwork.vue";

const props = defineProps<{
  modelValue?: boolean;
  label: string;
  id: string;
  hint?: string;
  iconSrc: string;
}>();

const emit = defineEmits(["update:modelValue"]);

function emitValue() {
  emit("update:modelValue", !props.modelValue);
}
</script>

<template>
  <div
    :class="['checkbox-wrapper', { 'checkbox-wrapper--checked': modelValue }]"
  >
    <!-- Allow click on whole checkbox to check/uncheck -->
    <div class="checkbox-layer" @click="emitValue" />
    <div class="fr-checkbox-group fr-p-2w checkbox-input">
      <input
        :id="id"
        :checked="modelValue"
        type="checkbox"
        @change="emitValue"
      />
      <label class="fr-label" :for="id">
        {{ label }}
        <span v-if="hint" class="fr-hint-text" v-html="hint" />
      </label>
    </div>
    <div class="fr-p-2w checkbox-artwork-wrapper">
      <DsfrArtwork :file-path="iconSrc" class="checkbox-artwork" />
    </div>
  </div>
</template>

<style scoped>
.checkbox-wrapper {
  border: 1px solid var(--border-default-grey);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  position: relative;

  &:hover {
    background-color: var(--grey-975-100);
  }

  &:active {
    background-color: var(--background-default-grey-active);
  }

  &.checkbox-wrapper--checked {
    border-color: var(--border-active-blue-france);
  }
}

.checkbox-layer {
  position: absolute;
  inset: 0;
  opacity: 0.3;
  cursor: pointer;
  z-index: 1;
}

.checkbox-artwork-wrapper {
  display: flex;
  position: relative;

  &::before {
    content: "";
    width: 1px;
    height: calc(100% - 0.5rem); /* 100% - (2 * 4px) */
    background-color: var(--border-default-grey);
    right: calc(100%);
    top: 0.25rem;
    position: absolute;
  }
}

.checkbox-artwork {
  --checkbox-artwork-width: 3.5rem;

  height: var(--checkbox-artwork-width);
  width: var(--checkbox-artwork-width);
}

/* Override some values to center and adjust spacing between label and checkbox */
.fr-checkbox-group input[type="checkbox"] + label {
  margin-left: 2.2rem !important;

  &::before {
    left: -2.2rem !important;
    top: unset !important;
  }
}
</style>
