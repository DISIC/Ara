<script lang="ts" setup>
import { ref } from "vue";
import DsfrModal from "./DsfrModal.vue";

const modal = ref<InstanceType<typeof DsfrModal>>();

defineEmits(["closed", "confirm"]);

defineExpose({
  show: () => modal.value?.show(),
  hide: () => modal.value?.hide()
});
</script>

<template>
  <DsfrModal
    id="delete-modal"
    ref="modal"
    aria-labelledby="delete-modal-title"
    @closed="$emit('closed')"
  >
    <div class="fr-container fr-container--fluid fr-container-md">
      <div class="fr-grid-row fr-grid-row--center">
        <div class="fr-col-12 fr-col-md-8">
          <div class="fr-modal__body">
            <div class="fr-modal__header">
              <button class="fr-btn--close fr-btn" aria-controls="delete-modal">
                Fermer
              </button>
            </div>
            <div class="fr-modal__content">
              <h1 id="delete-modal-title" class="fr-modal__title">
                <span
                  class="fr-icon-warning-line fr-fi--lg"
                  aria-hidden="true"
                />
                Vous allez supprimer l’audit
              </h1>
              <p>
                Toutes les informations saisies seront effacées (cela comprend
                l’audit, le rapport et toute donnée personnelle associée). Cette
                action est irréversible. Souhaitez-vous supprimer l’audit ?
              </p>
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
                    Oui, supprimer
                  </button>
                </li>
                <li>
                  <button
                    class="fr-btn fr-btn--secondary"
                    @click="modal?.hide()"
                  >
                    Non
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

<style scoped>
/* FIXME: create utility class (`fr-btn__danger` and `fr-btn__danger-outline`) */
.danger-button {
  background-color: var(--background-action-high-error);
}

.danger-button:hover {
  background-color: var(--background-action-high-error-hover);
}

.danger-button:focus {
  background-color: var(--background-action-high-error-active);
}
</style>
