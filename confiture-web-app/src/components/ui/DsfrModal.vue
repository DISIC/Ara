<script lang="ts">
export default {
  inheritAttrs: false
};
</script>

<script lang="ts" setup>
import { ref } from "vue";

defineProps<{
  id: string;
}>();

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

const isOpened = ref(false);

function onConceal() {
  /*
  FIXME: For some reason, the DSFR modal emits the `dsfr.conceal` event as
  soon as the page loads. We want to ignore this one event fire so we track if
  the modal is *actually* opened before firing our own event.
  */
  if (!isOpened.value) {
    return;
  }

  isOpened.value = false;
  setTimeout(() => {
    if (triggerElement.value && triggerElement.value.isConnected) {
      triggerElement.value.focus();
    }
    emit("closed");
  });
}

function onDisclose() {
  isOpened.value = true;
}

defineExpose({ show, hide });
</script>

<template>
  <Teleport to="body">
    <!--
    FIXME: For some reason, in v1.10 of the DSFR, a modal MUST have an activation
    button. Otherwise the javascript API to manually open the modal won't work.

    See: https://github.com/GouvernementFR/dsfr/issues/728
    -->
    <button hidden data-fr-opened="false" :aria-controls="id"></button>

    <dialog
      :id="id"
      ref="modal"
      role="dialog"
      class="fr-modal"
      v-bind="$attrs"
      v-on="{ 'dsfr.conceal': onConceal, 'dsfr.disclose': onDisclose }"
    >
      <slot />
    </dialog>
  </Teleport>
</template>

<style scoped>
.modal-side-bar {
  padding-inline-end: 0;
}

.modal-side-bar::before,
.modal-side-bar::after {
  content: unset;
}

.modal-side-bar :deep(.fr-modal__body) {
  max-height: 100vh !important;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.modal-side-bar :deep(.fr-grid-row--center) {
  justify-content: flex-end;
}

.modal-side-bar :deep(.fr-modal__footer) {
  flex-grow: 1;
  align-items: flex-end;
}
</style>
