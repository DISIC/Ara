<script setup lang="ts">
import { computed, ref } from "vue";

import DsfrModal from "../ui/DsfrModal.vue";

const modal = ref<InstanceType<typeof DsfrModal>>();
const isOpen = ref(false);

const props = defineProps<{
  mimeType?: string;
}>();

defineEmits(["confirm", "cancel"]);

defineExpose({
  show: () => {
    isOpen.value = true;
    modal.value?.show();
  },
  hide: () => modal.value?.hide(),
  isOpen
});

const isImage = computed(() => {
  return props.mimeType && props.mimeType.startsWith("image");
});

const title = computed(() => {
  return isImage.value
    ? "Voulez-vous supprimer cette image ?"
    : "Voulez-vous supprimer ce fichier ?";
});

const description = computed(() => {
  return isImage.value
    ? "Cette image sera définitivement supprimée de votre audit."
    : "Ce fichier sera définitivement supprimé de votre audit.";
});

const confirm = computed(() => {
  return isImage.value ? "Supprimer l’image" : "Supprimer le fichier";
});
</script>

<template>
  <DsfrModal
    id="delete-file-modal"
    ref="modal"
    aria-labelledby="delete-file-modal-title"
    @closed="isOpen = false"
  >
    <div class="fr-container fr-container--fluid fr-container-md">
      <div class="fr-grid-row fr-grid-row--center">
        <div class="fr-col-12 fr-col-md-8">
          <div class="fr-modal__body">
            <div class="fr-modal__header">
              <button
                class="fr-btn--close fr-btn"
                aria-controls="delete-file-modal"
              >
                Fermer
              </button>
            </div>
            <div class="fr-modal__content">
              <h1 id="delete-file-modal-title" class="fr-modal__title">
                {{ title }}
              </h1>
              <p>{{ description }}</p>
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
                    {{ confirm }}
                  </button>
                </li>
                <li>
                  <button
                    class="fr-btn fr-btn--secondary"
                    @click="$emit('cancel')"
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
