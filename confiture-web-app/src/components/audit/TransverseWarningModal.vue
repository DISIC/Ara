<script lang="ts" setup>
import { ref } from "vue";
import DsfrModal from "../ui/DsfrModal.vue";

const modal = ref<InstanceType<typeof DsfrModal>>();

const emit = defineEmits<{
  (e: "closed"): void;
  (e: "confirm"): void;
}>();

defineExpose({
  show: () => modal.value?.show(),
  hide: () => modal.value?.hide()
});

function handleClose() {
  modal.value?.hide();
}

function handleConfirm() {
  modal.value?.hide();
  emit("confirm");
}
</script>

<template>
  <DsfrModal
    id="transverse-warning-modal"
    ref="modal"
    aria-labelledby="transverse-warning-title"
    @closed="$emit('closed')"
  >
    <div class="fr-container fr-container--fluid fr-container-md">
      <div class="fr-grid-row fr-grid-row--center">
        <div class="fr-col-12 fr-col-md-8">
          <div class="fr-modal__body">
            <div class="fr-modal__header">
              <button
                class="fr-btn--close fr-btn"
                aria-controls="transverse-warning-modal"
                type="button"
              >
                Fermer
              </button>
            </div>
            <div class="fr-modal__content">
              <h1 id="transverse-warning-title" class="fr-modal__title">
                <span class="fr-icon-alert-line" aria-hidden="true"></span>
                Ce critère est déjà évalué sur d'autres pages
              </h1>
              <p>
                Vous aller définir ce critère comme [statut critère] sur
                <strong>toutes les pages</strong> de l'échantillon. Les saisies
                déià réalisés pour ce critère dans d'autres pages ne seront pas
                perdues.
              </p>
            </div>
            <div class="fr-modal__footer">
              <ul
                class="fr-btns-group fr-btns-group--right fr-btns-group--inline-lg"
              >
                <li>
                  <button class="fr-btn fr-btn--secondary" @click="handleClose">
                    Annuler
                  </button>
                </li>
                <li>
                  <button class="fr-btn" @click="handleConfirm">
                    Appliquer sur toutes les pages
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
