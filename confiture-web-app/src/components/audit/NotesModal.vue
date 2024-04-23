<script lang="ts" setup>
import { ref, watch } from "vue";

import DsfrModal from "../ui/DsfrModal.vue";
import { useIsOffline } from "../../composables/useIsOffline";
import { useAuditStore } from "../../store/audit";

defineProps<{
  isLoading: boolean;
}>();

const emit = defineEmits<{
  (e: "closed"): void;
  (e: "confirm", payload: string): void;
}>();

defineExpose({
  show: () => modal.value?.show(),
  hide: () => modal.value?.hide()
});

const auditStore = useAuditStore();

const modal = ref<InstanceType<typeof DsfrModal>>();
const isOffline = useIsOffline();

const notes = ref("");

function handleSubmit() {
  emit("confirm", notes.value);
}

function handleClose() {
  modal.value?.hide();
}

watch(auditStore, () => {
  notes.value = auditStore.currentAudit?.notes ?? "";
});
</script>

<template>
  <DsfrModal
    id="notes-modal"
    ref="modal"
    aria-labelledby="notes-modal-title"
    class="modal-side-bar"
    @closed="$emit('closed')"
  >
    <form @submit.prevent="handleSubmit">
      <div class="fr-grid-row fr-grid-row--center">
        <div class="fr-col-12 fr-col-md-8">
          <div class="fr-modal__body">
            <div class="fr-modal__header">
              <button
                class="fr-btn--close fr-btn"
                aria-controls="notes-modal"
                type="button"
              >
                Fermer
              </button>
            </div>
            <div class="fr-modal__content">
              <h1 id="notes-modal-title" class="fr-modal__title sr-only">
                Annoter l’audit
              </h1>
              <div class="fr-input-group fr-mb-1v">
                <label class="fr-label" for="audit-notes">
                  Commentaire sur votre audit
                  <span class="fr-hint-text">
                    Exemple : remarques et recommandations générales sur le site
                    audité. Ces notes seront affichées dans le rapport d’audit.
                  </span>
                </label>
                <textarea
                  id="audit-notes"
                  v-model="notes"
                  class="fr-input"
                  rows="10"
                  :disabled="isOffline"
                  aria-describedby="notes-markdown"
                ></textarea>
              </div>
              <p id="notes-markdown" class="fr-text--sm fr-m-0">
                Markdown pris en compte
              </p>
            </div>
            <div class="fr-modal__footer">
              <ul class="fr-btns-group fr-btns-group--inline-lg">
                <li>
                  <button class="fr-btn" :disabled="isLoading" type="submit">
                    Enregistrer
                  </button>
                </li>
                <li>
                  <button
                    class="fr-btn fr-btn--secondary"
                    type="button"
                    @click="handleClose"
                  >
                    Annuler
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </form>
  </DsfrModal>
</template>
