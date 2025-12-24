<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useTemplateRef } from "vue";
import { useDialogStore } from "../store";
import DsfrModal from "./ui/DsfrModal.vue";

const genericModalRef = useTemplateRef("genericModalRef");

const store = useDialogStore();
const { dialog } = storeToRefs(store);

// Watch for store state to show modal dialog
store.$subscribe((_mutation, state) => {
  if (state.dialog) {
    genericModalRef.value?.show();
  }
});

function onConfirm() {
  genericModalRef.value?.hide({
    getElementToFocus: dialog?.value?.confirmAction?.focus
  });
  dialog?.value?.confirmAction?.cb?.();
};

function onCancel() {
  genericModalRef.value?.hide();
};

// Reset dialog data when it has completely disappeared
function onFadedOut() {
  store.resetDialogData();
}
</script>

<template>
  <DsfrModal
    id="generic-modal"
    ref="genericModalRef"
    aria-labelledby="generic-modal-title"
    @closed="onCancel"
    @faded-out="onFadedOut"
  >
    <div class="fr-container fr-container--fluid fr-container-md">
      <div class="fr-grid-row fr-grid-row--center">
        <div class="fr-col-12 fr-col-md-8">
          <div class="fr-modal__body">
            <div class="fr-modal__header">
              <button
                class="fr-btn fr-btn--close"
                aria-controls="generic-modal"
                type="button"
              >
                Fermer
              </button>
            </div>
            <div class="fr-modal__content">
              <h1 id="generic-modal-title" class="fr-modal__title">
                <span
                  v-if="dialog?.titleIcon"
                  :class="`${dialog?.titleIcon} fr-fi--lg`"
                  aria-hidden="true"
                />
                {{ dialog?.title }}
              </h1>
              <p v-html="dialog?.message"></p>
            </div>
            <div class="fr-modal__footer">
              <ul class="fr-btns-group fr-btns-group--right fr-btns-group--inline-reverse fr-btns-group--inline-lg fr-btns-group--icon-left">
                <li>
                  <button class="fr-btn" :class="{ 'danger-button': dialog?.isDanger }" @click="onConfirm" v-html="dialog?.confirmLabel"></button>
                </li>
                <li>
                  <button class="fr-btn fr-btn--secondary" @click="onCancel" v-html="dialog?.cancelLabel"></button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DsfrModal>
</template>
