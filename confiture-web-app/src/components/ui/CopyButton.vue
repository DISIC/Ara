<script lang="ts" setup>
import { ref } from "vue";
import { RouteLocationRaw } from "vue-router";
import router from "../../router";

/**
 * FIXME: trigger warning ⚠️ the code of the following component is a bit dirty.
 *
 * The goal is to create a button that changes its content
 * when clicked without changing its size, in 2 different contexts.
 */
const props = withDefaults(defineProps<{
  icon: string;
  label?: string;
  successLabel?: string;
  hiddenLabelSuffix?: string;
  contentToCopy: string | RouteLocationRaw | (() => string);
  isWithinBtnGroup?: boolean;
}>(), {
  label: "Copier le lien de partage",
  successLabel: "Lien copié"
});

const showSuccess = ref(true);

function copyContentToClipboard() {
  if (showSuccess.value) return;

  let content: string;
  switch (typeof props.contentToCopy) {
    case "object":
      content = window.location.origin
        + router.resolve(props.contentToCopy).fullPath;
      break;
    case "function":
      content = props.contentToCopy();
      break;
    default:
      content = props.contentToCopy;
  }

  console.log({ content });

  navigator.clipboard.writeText(content).then(() => {
    showSuccess.value = true;
  });

  setTimeout(() => {
    showSuccess.value = false;
  }, 3500);
}
</script>

<template>
  <button
    ref="copyButtonRef"
    type="button"
    :class="[`fr-btn fr-btn--secondary fr-btn--icon-left ${showSuccess ? 'fr-icon-check-line copy-button--success' : icon} copy-button`, {
      'copy-button--within-btn-group fr-mb-0': isWithinBtnGroup
    }]"
    @click="copyContentToClipboard"
  >
    <template v-if="isWithinBtnGroup">
      {{ showSuccess ? successLabel : label }}
    </template>

    <span v-else class="copy-button-outer-wrapper" :style="{ '--content': `'${label}'` }">
      <span class="copy-button-inner-wrapper">
        <template v-if="showSuccess">
          <span class="fr-icon-check-line copy-button-success-icon" aria-hidden="true" />
          {{ successLabel }}
        </template>
        <template v-else>
          {{ label }}
        </template>
      </span>
    </span>

    <span v-if="hiddenLabelSuffix" class="fr-sr-only">{{ hiddenLabelSuffix }}</span>
  </button>
</template>

<style scoped>
.copy-button {
  &:not(.copy-button--within-btn-group) {
    .copy-button-outer-wrapper {
      position: relative;

      &::after {
        content: var(--content);
        visibility: hidden;
      }

      .copy-button-inner-wrapper {
        position: absolute;
        inset: 0;
        display: flex;
        gap: 0.5rem;
      }

      .copy-button-success-icon::before {
        --icon-size: 1rem;
      }
    }
  }
}

.copy-button--success {
  color: var(--text-default-success) !important;
  box-shadow: inset 0 0 0 1px var(--text-default-success) !important;

  &:not(.copy-button--within-btn-group) {
    .copy-button-inner-wrapper {
      translate: 1.5rem;
    }

    &::before {
      opacity: 0 !important;
    }
  }
}
</style>
