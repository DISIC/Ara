<script setup lang="ts">
import { ref } from "vue";
import { useModal } from "../composables/useModal";
import DsfrModal from "./ui/DsfrModal.vue";

const genericModalRef = ref<InstanceType<typeof DsfrModal>>();

const {
  title,
  message,
  confirmLabel,
  cancelLabel,
  confirm,
  cancel,
  onConfirm,
  onCancel,
  onReveal,
  getFocusOnConceal
} = useModal();

onConfirm(() => {
  genericModalRef.value?.hide({
    getFocusElement: getFocusOnConceal.value || null
  });
});

onCancel(() => {
  genericModalRef.value?.hide();
});

onReveal(() => {
  genericModalRef.value?.show();
});
</script>

<template>
  <DsfrModal
    id="generic-modal"
    ref="genericModalRef"
    aria-labelledby="generic-modal-title"
    @closed="cancel"
  >
    <div class="fr-container fr-container--fluid fr-container-md">
      <div class="fr-grid-row fr-grid-row--center">
        <div class="fr-col-12 fr-col-md-8">
          <div class="fr-modal__body">
            <div class="fr-modal__header">
              <button
                class="fr-btn--close fr-btn"
                aria-controls="generic-modal"
              >
                Fermer
              </button>
            </div>
            <div class="fr-modal__content">
              <h1 id="generic-modal-title" class="fr-modal__title">{{ title }}</h1>
              <p v-html="message"></p>
            </div>
            <div class="fr-modal__footer">
              <ul class="fr-btns-group fr-btns-group--right fr-btns-group--inline-reverse fr-btns-group--inline-lg fr-btns-group--icon-left">
                <li>
                  <button class="fr-btn danger-button" @click="confirm()" v-html="confirmLabel"></button>
                </li>
                <li>
                  <button class="fr-btn fr-btn--secondary" @click="cancel" v-html="cancelLabel"></button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DsfrModal>
</template>
