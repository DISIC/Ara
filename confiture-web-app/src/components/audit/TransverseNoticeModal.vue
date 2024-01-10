<script lang="ts" setup>
import { ref } from "vue";
import DsfrModal from "../ui/DsfrModal.vue";

const modal = ref<InstanceType<typeof DsfrModal>>();

defineProps<{
  pageName: string;
}>();

const emit = defineEmits<{
  (e: "closed"): void;
  (e: "confirmOnAllPages"): void;
  (e: "confirmOnPage"): void;
}>();

defineExpose({
  show: () => modal.value?.show(),
  hide: () => modal.value?.hide()
});

function handleClose() {
  modal.value?.hide();
}

function handleApplyOnAllPages() {
  console.log("handleApplyOnAllPages");
  emit("confirmOnAllPages");
}

function handleApplyOnPage() {
  console.log("handleApplyOnPage");
  emit("confirmOnPage");
}
</script>

<template>
  <DsfrModal
    id="transverse-notice-modal"
    ref="modal"
    aria-labelledby="transverse-notice-title"
    @closed="$emit('closed')"
  >
    <div class="fr-container fr-container--fluid fr-container-md">
      <div class="fr-grid-row fr-grid-row--center">
        <div class="fr-col-12 fr-col-md-8">
          <div class="fr-modal__body">
            <div class="fr-modal__header">
              <button
                class="fr-btn--close fr-btn"
                aria-controls="transverse-notice-modal"
                type="button"
              >
                Fermer
              </button>
            </div>
            <div class="fr-modal__content">
              <h1 id="transverse-notice-title" class="fr-modal__title">
                <span class="fr-icon-information-line" aria-hidden="true" />
                Ce critère a été défini comme transverse
              </h1>
              <p>
                Souhaitez-vous appliquer votre modification sur l’ensemble des
                pages de l’échantillon ou uniquement sur la page
                <strong>{{ pageName }}</strong>
              </p>
            </div>
            <div class="fr-modal__footer">
              <ul
                class="fr-btns-group fr-btns-group--right fr-btns-group--inline-lg"
              >
                <li>
                  <button
                    class="fr-btn fr-btn--tertiary-no-outline"
                    @click="handleClose"
                  >
                    Annuler
                  </button>
                </li>
                <li>
                  <button
                    class="fr-btn fr-btn--secondary"
                    @click="handleApplyOnAllPages"
                  >
                    Appliquer sur toutes les pages
                  </button>
                </li>
                <li>
                  <button class="fr-btn" @click="handleApplyOnPage">
                    Appliquer sur cette page
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DsfrModal>
</template>
