<script lang="ts" setup>
import { templateRef } from "@vueuse/core";
import { onMounted, ref } from "vue";
import { RouteLocationRaw } from "vue-router";
import router from "../../router";

const props = withDefaults(defineProps<{
  icon: string;
  label?: string;
  successLabel?: string;
  contentToCopy: string | RouteLocationRaw;
  isWithinBtnGroup?: boolean;
}>(), {
  label: "Copier le lien de partage",
  successLabel: "Lien de partage copié"
});

const showSuccess = ref(false);

function copyContentToClipboard() {
  const content = typeof props.contentToCopy === "string"
    ? props.contentToCopy
    : window.location.origin + router.resolve(props.contentToCopy).fullPath;

  navigator.clipboard.writeText(content).then(() => {
    showSuccess.value = true;
  });

  setTimeout(() => {
    showSuccess.value = false;
  }, 3500);
}

const initialButtonWidth = ref<string>();
const copyButtonRef = templateRef("copyButtonRef");
onMounted(() => {
  initialButtonWidth.value = `${copyButtonRef.value?.offsetWidth}px`;
});
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
    {{ showSuccess ? successLabel : label }}
  </button>
</template>

<style scoped>
.copy-button {
  &:not(.copy-button--within-btn-group) {
    width: v-bind(initialButtonWidth) !important;
    justify-content: center !important;
  }
}

.copy-button--success {
  color: var(--text-default-success) !important;
  box-shadow: inset 0 0 0 1px var(--text-default-success) !important;
}
</style>
