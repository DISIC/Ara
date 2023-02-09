<script setup lang="ts">
import { ref } from "vue";
import DsfrModal from "./DsfrModal.vue";

defineProps<{
  title: string;
  icon: string;
  confirm: string;
  cancel: string;
  danger?: boolean;
}>();

const modal = ref<InstanceType<typeof DsfrModal>>();
const isOpen = ref(false);

defineEmits(["confirm"]);

defineExpose({
  show: () => {
    isOpen.value = true;
    modal.value?.show();
  },
  hide: () => modal.value?.hide(),
  isOpen,
});
</script>

<template>
  <DsfrModal
    id="leave-modal"
    ref="modal"
    aria-labelledby="leave-modal-title"
    @closed="isOpen = false"
  >
    <div class="fr-container fr-container--fluid fr-container-md">
      <div class="fr-grid-row fr-grid-row--center">
        <div class="fr-col-12 fr-col-md-8">
          <div class="fr-modal__body">
            <div class="fr-modal__header">
              <button class="fr-btn--close fr-btn" aria-controls="leave-modal">
                Fermer
              </button>
            </div>
            <div class="fr-modal__content">
              <h1 id="leave-modal-title" class="fr-modal__title">
                <span :class="`${icon} fr-fi--lg`" aria-hidden="true"></span>
                {{ title }}
              </h1>
              <slot />
            </div>
            <div class="fr-modal__footer">
              <ul
                class="fr-btns-group fr-btns-group--right fr-btns-group--inline-reverse fr-btns-group--inline-lg fr-btns-group--icon-left"
              >
                <li>
                  <button
                    :class="['fr-btn', { 'danger-button': danger }]"
                    @click="$emit('confirm')"
                  >
                    {{ confirm }}
                  </button>
                </li>
                <li>
                  <button
                    class="fr-btn fr-btn--secondary"
                    @click="modal?.hide()"
                  >
                    {{ cancel }}
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
