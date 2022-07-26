<script setup lang="ts">
defineProps<{
  title: string;
  confirm: string;
  cancel: string;
}>();

defineEmits(["confirm", "cancel"]);
</script>

<template>
  <dialog
    id="leave-modal"
    aria-labelledby="leave-modal-title"
    class="fr-modal"
    role="dialog"
  >
    <div class="fr-container fr-container--fluid fr-container-md">
      <div class="fr-grid-row fr-grid-row--center">
        <div class="fr-col-12 fr-col-md-8 fr-col-lg-6">
          <div class="fr-modal__body">
            <div class="fr-modal__header">
              <button class="fr-btn--close fr-btn" aria-controls="leave-modal">
                Fermer
              </button>
            </div>
            <div class="fr-modal__content">
              <h1 id="leave-modal-title" class="fr-modal__title">
                <span
                  class="fr-fi-arrow-right-line fr-fi--lg"
                  aria-hidden="true"
                ></span>
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
                    class="fr-btn fr-fi-checkbox-line"
                    @click="$emit('confirm')"
                  >
                    {{ confirm }}
                  </button>
                </li>
                <li>
                  <button
                    class="fr-btn fr-fi-checkbox-line fr-btn--secondary"
                    @click="$emit('cancel')"
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
  </dialog>
</template>
