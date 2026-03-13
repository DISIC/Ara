<script lang="ts" setup>
import { ref } from "vue";

import DsfrModal from "../ui/DsfrModal.vue";

const modal = ref<InstanceType<typeof DsfrModal>>();

const props = defineProps<{
  auditName: string;
  editUniqueId: string;
}>();

defineEmits<{
  (e: "closed"): void;
}>();

defineExpose({
  show: () => modal.value?.show(),
  hide: () => modal.value?.hide()
});

// TODO: plug prop as default value
const auditIsPublic = ref(false);

// Copy audit public URL
const showCopySuccess = ref(false);
function copyLink() {
  if (showCopySuccess.value) return;

  const url = `${window.location.origin}/audits/${props.editUniqueId}/generation`;

  navigator.clipboard.writeText(url).then(() => {
    showCopySuccess.value = true;
  });

  setTimeout(() => {
    showCopySuccess.value = false;
  }, 3500);
}

// TODO: make api call
function toggleAuditPrivacy() {
  if (auditIsPublic.value) {
    console.log("audit is public");
  } else {
    console.log("audit is private");
  }
}
</script>

<template>
  <DsfrModal
    :id="`share-modal-${editUniqueId}`"
    ref="modal"
    :aria-labelledby="`share-modal-title-${editUniqueId}`"
    @closed="$emit('closed')"
  >
    <div class="fr-container fr-container--fluid fr-container-md">
      <div class="fr-grid-row fr-grid-row--center">
        <div class="fr-col-12 fr-col-md-8">
          <div class="fr-modal__body">
            <div class="fr-modal__header">
              <button
                class="fr-btn--close fr-btn"
                :aria-controls="`share-modal-${editUniqueId}`"
                type="button"
              >
                Fermer
              </button>
            </div>
            <div class="fr-modal__content">
              <h1 :id="`share-modal-title-${editUniqueId}`" class="fr-modal__title fr-mb-4w">
                Partager l’audit « {{ auditName }} »
              </h1>

              <div class="fr-toggle fr-toggle-lg fr-toggle--label-left fr-mb-2w">
                <input
                  :id="`audit-privacy-${editUniqueId}`"
                  v-model="auditIsPublic"
                  type="checkbox"
                  class="fr-toggle__input"
                  aria-describedby="privacy-description privacy-warning"
                  @change="toggleAuditPrivacy"
                >
                <label class="fr-toggle__label fr-text--lg" :for="`audit-privacy-${editUniqueId}`">Rendre l’audit public</label>
              </div>

              <p id="privacy-description" class="fr-text--sm fr-mb-2w privacy-description">
                <span aria-hidden="true" :class="auditIsPublic ? 'fr-icon-earth-line' : 'fr-icon-lock-line'" class="fr-mr-1v privacy-icon" />
                {{ auditIsPublic ? 'Toute personne disposant du lien peut accéder à l’audit et le modifier' : 'Vous êtes la seule personne à pouvoir accéder à l’audit et le modifier' }}
              </p>
              <template v-if="auditIsPublic">
                <p id="privacy-warning" class="fr-message fr-message--info fr-mb-3w">La modification d’un champ par plusieurs personnes en même temps peut entraîner une perte des saisies dans le champ.</p>
                <div class="fr-btns-group fr-btns-group--icon-left">
                  <button
                    class="fr-btn fr-btn--secondary fr-btn--icon-left fr-mb-0"
                    :class="showCopySuccess ? 'fr-icon-check-line copy-link-button' : 'fr-icon-link'"
                    type="button"
                    @click="copyLink"
                  >
                    {{ showCopySuccess ? 'Lien de partage copié' : 'Copier le lien de partage' }}
                  </button>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DsfrModal>
</template>

<style scoped>
.privacy-icon {
  color: var(--blue-france-sun-113-625);
}

.privacy-description {
  color: var(--text-mention-grey);
}

.copy-link-button {
  color: var(--text-default-success) !important;
  box-shadow: inset 0 0 0 1px var(--text-default-success) !important;
}
</style>
