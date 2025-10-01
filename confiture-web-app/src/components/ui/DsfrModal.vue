<script lang="ts">
export default {
  inheritAttrs: false
};
</script>

<script lang="ts" setup>
import { ref } from "vue";

defineProps<{
  id: string;
  isSidebar?: boolean;
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
      :class="['fr-modal', { sidebar: isSidebar }]"
      v-bind="$attrs"
      v-on="{ 'dsfr.conceal': onConceal, 'dsfr.disclose': onDisclose }"
    >
      <slot />
    </dialog>
  </Teleport>
</template>

<style scoped>
.sidebar {
  padding-inline-end: 0;
}

.sidebar::before,
.sidebar::after {
  content: unset;
}

.sidebar > :deep(.fr-container) {
  padding-inline: 0;
  max-width: unset;
}

.sidebar :deep(.fr-grid-row) {
  justify-content: flex-end;
}

.sidebar :deep(.fr-modal__body) {
  max-height: 100vh !important;
  max-height: 100dvh !important;
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
}

.sidebar :deep(.fr-modal__content) {
  margin-bottom: 0;
}

.sidebar :deep(textarea) {
  height: 50vh;
  height: 50dvh;
  max-height: 60rem;
}

.sidebar :deep(.sidebar-col) {
  flex: 0 0 56rem;
}

@media (width < 57rem) {
  .sidebar :deep(.sidebar-col) {
    margin-top: 1rem;
  }
}

@media (width < 55rem) {
  .sidebar :deep(.sidebar-col) {
    flex: 0 0 100%;
    max-width: 100%;
    width: 100%;
  }
}
</style>
