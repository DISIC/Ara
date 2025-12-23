<script lang="ts" setup>
import { nextTick, shallowRef, useTemplateRef } from "vue";

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
  (e: "fadedOut"): void;
}>();

// If the confirm action of the modal caused the deletion of the item containing
// the button that triggered the modal disclosure, we need to specify which
// element will be focused on conceal.
// Using a function allows to spot the HTML element to focus at the last moment,
// after the modal is actually concealed and DOM may have been updated.
type GetElementToFocusOnConceal = (() => HTMLElement | null);
const getElementToFocusOnConceal = shallowRef<GetElementToFocusOnConceal>();

const modalRef = useTemplateRef("modalRef");

const triggerElement = shallowRef<HTMLElement>();

function onFadedOut() {
  emit("fadedOut");
}

function show() {
  if (document.activeElement) {
    triggerElement.value = document.activeElement as HTMLElement;
  }

  modalRef.value?.removeEventListener("transitionend", onFadedOut);

  dsfr(modalRef.value).modal.disclose();
}

function hide(options?: { getElementToFocus?: GetElementToFocusOnConceal }) {
  getElementToFocusOnConceal.value = options?.getElementToFocus;
  modalRef.value?.addEventListener(
    "transitionend",
    onFadedOut,
    { once: true }
  );
  dsfr(modalRef.value).modal.conceal();
}

async function onConceal() {
  await nextTick();
  const elementToFocus = getElementToFocusOnConceal.value?.();
  if (elementToFocus?.isConnected) {
    elementToFocus.focus();
  } else if (triggerElement.value?.isConnected) {
    triggerElement.value.focus();
  }
  emit("closed");
}

defineExpose({ show, hide });
</script>

<template>
  <Teleport to="body">
    <dialog
      :id="id"
      ref="modalRef"
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
