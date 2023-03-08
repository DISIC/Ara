<script lang="ts">
export default {
  inheritAttrs: false,
};
</script>

<script lang="ts" setup>
import { ref } from "vue";

const emit = defineEmits<{
  (e: "closed"): void;
}>();

const modal = ref<HTMLDialogElement>();

const triggerElement = ref<HTMLElement>();

function show() {
  if (document.activeElement) {
    triggerElement.value = document.activeElement as HTMLElement;
  }

  dsfr(modal.value).modal.disclose();
}

function hide() {
  dsfr(modal.value).modal.conceal();
}

function onConceal() {
  setTimeout(() => {
    if (triggerElement.value && triggerElement.value.isConnected) {
      triggerElement.value.focus();
    }
    emit("closed");
  });
}

defineExpose({ show, hide });
</script>

<template>
  <Teleport to="body">
    <dialog
      ref="modal"
      role="dialog"
      class="fr-modal"
      v-bind="$attrs"
      v-on="{ 'dsfr.conceal': onConceal }"
    >
      <slot />
    </dialog>
  </Teleport>
</template>
