<script lang="ts" setup>
import { ref } from "vue";

import DsfrField from "../ui/DsfrField.vue";
import DsfrModal from "../ui/DsfrModal.vue";

const modal = ref<InstanceType<typeof DsfrModal>>();

defineProps<{
  originalAuditName?: string;
  isLoading: boolean;
  id: string;
}>();

const emit = defineEmits<{
  (e: "closed"): void;
  (e: "confirm", payload: string): void;
}>();

defineExpose({
  show: () => modal.value?.show(),
  hide: () => modal.value?.hide()
});

const duplicateAuditNameRef = ref<HTMLInputElement>();
const duplicateAuditName = ref("");

function handleSubmit() {
  if (!duplicateAuditName.value) {
    duplicateAuditNameRef.value?.focus();
  } else {
    emit("confirm", duplicateAuditName.value);
    duplicateAuditName.value = "";
  }
}

function handleClose() {
  modal.value?.hide();
}
</script>

<template>
  <DsfrModal
    :id="`duplicate-modal-${id}`"
    ref="modal"
    :aria-labelledby="`duplicate-modal-title-${id}`"
    @closed="$emit('closed')"
  >
    <form @submit.prevent="handleSubmit">
      <div class="fr-container fr-container--fluid fr-container-md">
        <div class="fr-grid-row fr-grid-row--center">
          <div class="fr-col-12 fr-col-md-8">
            <div class="fr-modal__body">
              <div class="fr-modal__header">
                <button
                  class="fr-btn--close fr-btn"
                  :aria-controls="`duplicate-modal-${id}`"
                  type="button"
                >
                  Fermer
                </button>
              </div>
              <div class="fr-modal__content">
                <h1 :id="`duplicate-modal-title-${id}`" class="fr-modal__title">
                  Dupliquer l’audit
                  <template v-if="originalAuditName">
                    « {{ originalAuditName }} »
                  </template>
                </h1>
                <p>
                  La copie de votre audit reprendra l’intégralité des éléments
                  de l’audit initial : l’échantillon des pages à auditer, l’état
                  de conformité des critères, la description des erreurs et
                  recommandations, etc.
                </p>
                <DsfrField
                  :id="`duplicate-audit-name-${id}`"
                  ref="duplicateAuditNameRef"
                  v-model="duplicateAuditName"
                  label="Nom de la copie"
                  :hint="`Exemple : contre-audit ${
                    originalAuditName ?? 'site DesignGouv'
                  }`"
                  type="text"
                  required
                  :disabled="isLoading"
                />
              </div>
              <div class="fr-modal__footer">
                <ul
                  class="fr-btns-group fr-btns-group--right fr-btns-group--inline-lg"
                >
                  <li>
                    <button
                      class="fr-btn fr-btn--secondary"
                      type="button"
                      @click="handleClose"
                    >
                      Annuler
                    </button>
                  </li>
                  <li>
                    <button class="fr-btn" :disabled="isLoading" type="submit">
                      Dupliquer l’audit
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  </DsfrModal>
</template>
