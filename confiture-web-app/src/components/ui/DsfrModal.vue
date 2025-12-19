<script lang="ts" setup>
import { shallowRef } from "vue";

defineOptions({
  inheritAttrs: false
});

interface Props {
  id: string;
  isSidebar?: boolean;
}
withDefaults(defineProps<Props>(), {
  isSidebar: false
});

const emit = defineEmits<{
  (e: "closed"): void;
}>();

// If the confirm action of the modal caused the deletion of the item containing
// the button that triggered the modal disclosure, we need to specify which
// element will be focused on conceal.
// Using a function allows to spot the HTML element to focus at the last moment,
// after the modal is actually concealed and DOM may have been updated.
const getFocusOnConceal = shallowRef<(() => HTMLElement | null) | null>();

const modal = shallowRef<HTMLDialogElement>();

const triggerElement = shallowRef<HTMLElement>();

function show() {
  if (document.activeElement) {
    triggerElement.value = document.activeElement as HTMLElement;
  }

  dsfr(modal.value).modal.disclose();
}

function hide(options: { getFocusElement: (() => HTMLElement | null) | null }
  = { getFocusElement: () => null }) {
  getFocusOnConceal.value = options.getFocusElement;
  dsfr(modal.value).modal.conceal(false, true);
}

function onConceal() {
  setTimeout(() => {
    let elementToFocus;
    if (getFocusOnConceal.value) {
      elementToFocus = getFocusOnConceal.value();
    }
    if (elementToFocus && elementToFocus.isConnected) {
      elementToFocus.focus();
    } else if (triggerElement.value && triggerElement.value.isConnected) {
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
      :id="id"
      ref="modal"
      role="dialog"
      :class="['fr-modal', { sidebar: isSidebar }]"
      v-bind="$attrs"
      v-on="{ 'dsfr.conceal': onConceal }"
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
