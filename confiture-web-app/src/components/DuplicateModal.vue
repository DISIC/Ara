<script lang="ts" setup>
import { ref } from "vue";
import DsfrModal from "./DsfrModal.vue";

const modal = ref<InstanceType<typeof DsfrModal>>();

const emit = defineEmits<{
  (e: "closed"): void;
  (e: "confirm", payload: string): void;
}>();

defineExpose({
  show: () => modal.value?.show(),
  hide: () => modal.value?.hide(),
});

const duplicateAuditNameRef = ref<HTMLInputElement>();
const duplicateAuditName = ref("");
const showError = ref(false);

function handleSubmit() {
  if (!duplicateAuditName.value) {
    showError.value = true;
    duplicateAuditNameRef.value?.focus();
  } else {
    emit("confirm", duplicateAuditName.value);
    showError.value = false;
    duplicateAuditName.value = "";
  }
}

function handleClose() {
  modal.value?.hide();
  showError.value = false;
}
</script>

<template>
  <DsfrModal
    id="duplicate-modal"
    ref="modal"
    aria-labelledby="duplicate-modal-title"
    @closed="$emit('closed')"
  >
    <div class="fr-container fr-container--fluid fr-container-md">
      <div class="fr-grid-row fr-grid-row--center">
        <div class="fr-col-12 fr-col-md-8">
          <div class="fr-modal__body">
            <div class="fr-modal__header">
              <button
                class="fr-btn--close fr-btn"
                aria-controls="duplicate-modal"
              >
                Fermer
              </button>
            </div>
            <div class="fr-modal__content">
              <h1 id="duplicate-modal-title" class="fr-modal__title">
                Créer une copie de l’audit
              </h1>
              <p>
                La copie de votre audit conservera toutes les données qui ont
                été saisies durant l’audit.
              </p>
              <div class="fr-input-group">
                <label
                  :class="['fr-label', { 'fr-input-group--error': showError }]"
                  for="duplicate-audit-name"
                  >Nom de la copie
                  <span class="fr-hint-text">
                    Exemple : contre audit site DesignGouv
                  </span>
                </label>
                <input
                  id="duplicate-audit-name"
                  ref="duplicateAuditNameRef"
                  v-model="duplicateAuditName"
                  :class="['fr-input', { 'fr-input--error': showError }]"
                  type="text"
                  aria-describedby="duplicate-audit-name-error"
                  required
                />
                <p
                  v-if="showError"
                  id="duplicate-audit-name-error"
                  class="fr-error-text"
                >
                  Texte d’erreur obligatoire
                </p>
              </div>
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
                  <button class="fr-btn" @click="handleSubmit">
                    Créer une copie
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
