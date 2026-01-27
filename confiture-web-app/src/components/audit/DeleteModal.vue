<script lang="ts" setup>
import { ref } from "vue";

import DsfrModal from "../ui/DsfrModal.vue";

const modal = ref<InstanceType<typeof DsfrModal>>();

defineProps<{
  id: string;
  procedureName: string;
}>();

defineEmits(["closed", "confirm"]);

defineExpose({
  show: () => modal.value?.show(),
  hide: () => modal.value?.hide()
});
</script>

<template>
  <DsfrModal
    :id="`delete-modal-${id}`"
    ref="modal"
    :aria-labelledby="`delete-modal-title-${id}`"
    @closed="$emit('closed')"
  >
    <div class="fr-container fr-container--fluid fr-container-md">
      <div class="fr-grid-row fr-grid-row--center">
        <div class="fr-col-12 fr-col-md-8">
          <div class="fr-modal__body">
            <div class="fr-modal__header">
              <button
                class="fr-btn--close fr-btn"
                :aria-controls="`delete-modal-${id}`"
              >
                Fermer
              </button>
            </div>
            <div class="fr-modal__content">
              <h1 :id="`delete-modal-title-${id}`" class="fr-modal__title">
                <span
                  class="fr-icon-warning-line fr-fi--lg"
                  aria-hidden="true"
                />
                Supprimer l’audit « {{ procedureName }} »
              </h1>
              <p class="fr-mb-0">L’audit sera définitivement supprimé.</p>
              <p>Le rapport de cet audit restera accessible mais vos données personnelles seront supprimées.</p>
            </div>
            <div class="fr-modal__footer">
              <ul
                class="fr-btns-group fr-btns-group--right fr-btns-group--inline-reverse fr-btns-group--inline-lg fr-btns-group--icon-left"
              >
                <li>
                  <button
                    class="fr-btn danger-button"
                    @click="$emit('confirm')"
                  >
                    Supprimer définitivement l’audit
                  </button>
                </li>
                <li>
                  <button
                    class="fr-btn fr-btn--secondary"
                    @click="modal?.hide()"
                  >
                    Annuler
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
