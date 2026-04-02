<script lang="ts" setup>
import { ref } from "vue";

const props = defineProps<{
  icon: string;
  label: string;
  successLabel: string;
  contentToCopy: string;
}>();

const showSuccess = ref(false);

function copyContent() {
  navigator.clipboard.writeText(props.contentToCopy).then(() => {
    showSuccess.value = true;
  });

  setTimeout(() => {
    showSuccess.value = false;
  }, 3500);
}
</script>

<template>
  <div class="fr-btns-group fr-btns-group--equisized fr-btns-group--icon-left">
    <button
      type="button"
      :class="`fr-btn fr-btn--secondary ${showSuccess ? 'fr-icon-check-line copy-button--success' : icon} fr-m-0`"
      @click="copyContent"
    >
      {{ showSuccess ? successLabel : label }}
    </button>
  </div>
</template>

<style scoped>
.copy-button--success {
  color: var(--text-default-success) !important;
  box-shadow: inset 0 0 0 1px var(--text-default-success) !important;
}
</style>
