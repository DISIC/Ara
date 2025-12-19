<script setup lang="ts">
import { storeToRefs } from "pinia";
import { ref } from "vue";
import { useDialogStore } from "../store";
import DsfrModal from "./ui/DsfrModal.vue";

const genericModalRef = ref<InstanceType<typeof DsfrModal>>();

const store = useDialogStore();
const { dialogLogic, dialogData } = storeToRefs(store);

let timerId: undefined | ReturnType<typeof setTimeout> = undefined;
dialogLogic.value.onConfirm(async () => {
  genericModalRef.value?.hide({
    getFocusElement: dialogData.value?.getFocusOnConceal ?? null
  });
  // wait for modal to disappear before to reset data
  clearTimeout(timerId);
  timerId = setTimeout(() => {
    store.resetDialogData();
  }, 1000);
});

dialogLogic.value.onCancel(async () => {
  genericModalRef.value?.hide();
  // wait for modal to disappear before to reset data
  clearTimeout(timerId);
  timerId = setTimeout(() => {
    store.resetDialogData();
  }, 1000);
});

dialogLogic.value.onReveal(() => {
  clearTimeout(timerId);
  genericModalRef.value?.show();
});
</script>

<template>
  <DsfrModal
    id="generic-modal"
    ref="genericModalRef"
    aria-labelledby="generic-modal-title"
    @closed="dialogLogic.cancel"
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
              <h1 id="generic-modal-title" class="fr-modal__title">{{ dialogData?.title }}</h1>
              <p v-html="dialogData?.message"></p>
            </div>
            <div class="fr-modal__footer">
              <ul class="fr-btns-group fr-btns-group--right fr-btns-group--inline-reverse fr-btns-group--inline-lg fr-btns-group--icon-left">
                <li>
                  <button class="fr-btn danger-button" @click="dialogLogic.confirm()" v-html="dialogData?.confirmLabel"></button>
                </li>
                <li>
                  <button class="fr-btn fr-btn--secondary" @click="dialogLogic.cancel" v-html="dialogData?.cancelLabel"></button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DsfrModal>
</template>
