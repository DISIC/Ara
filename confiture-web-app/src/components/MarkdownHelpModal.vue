<script lang="ts" setup>
import { ref } from "vue";

import DsfrModal from "./DsfrModal.vue";

const modal = ref<InstanceType<typeof DsfrModal>>();

defineEmits(["confirm"]);

defineExpose({
  show: () => modal.value?.show(),
  hide: () => modal.value?.hide(),
});
</script>

<template>
  <DsfrModal
    id="markdown-help-modal"
    ref="modal"
    aria-labelledby="markdown-help-modal-title"
  >
    <div class="fr-container fr-container--fluid fr-container-md">
      <div class="fr-grid-row fr-grid-row--center">
        <div class="fr-col-12 fr-col-md-6 fr-col-lg-4">
          <div class="fr-modal__body">
            <div class="fr-modal__header">
              <button
                class="fr-btn--close fr-btn"
                aria-controls="markdown-help-modal"
                title="Fermer"
              >
                Fermer
              </button>
            </div>
            <div class="fr-modal__content">
              <h1 id="markdown-help-modal-title" class="fr-modal__title">
                Syntaxe markdown
              </h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DsfrModal>
</template>
