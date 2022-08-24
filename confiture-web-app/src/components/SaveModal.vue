<script setup lang="ts">
import { computed, ref } from "vue";

const props = defineProps<{
  auditId: string;
}>();
defineEmits(["close"]);
defineExpose({ open });

const modalRef = ref();

function open() {
  dsfr(modalRef.value).modal.disclose();
}

const showCopyAlert = ref(false);
const link = computed(() => {
  return `${import.meta.env.VITE_BASE_URL}/audits/${
    props.auditId
  }/informations-generales`;
});

async function copyLink() {
  navigator.clipboard
    .writeText(link.value)
    .then(() => {
      showCopyAlert.value = true;
    })
    .catch((err) => {
      console.error(`Error copying admin URL to the clipboard: ${err}.`);
    });
}

function hideCopyAlert() {
  showCopyAlert.value = false;
}
</script>

<template>
  <dialog
    id="save-modal"
    ref="modalRef"
    aria-labelledby="save-modal-title"
    class="fr-modal"
    role="dialog"
  >
    <div class="fr-container fr-container--fluid fr-container-md">
      <div class="fr-grid-row fr-grid-row--center">
        <div class="fr-col-12 fr-col-md-8">
          <div class="fr-modal__body">
            <div class="fr-modal__header">
              <button class="fr-btn--close fr-btn" aria-controls="save-modal">
                Fermer
              </button>
            </div>
            <div class="fr-modal__content">
              <h1 id="save-modal-title" class="fr-modal__title fr-mb-4w">
                Sauvegardez le lien de votre audit
              </h1>
              <div
                class="fr-callout fr-callout--orange-terre-battue fr-icon-warning-line"
              >
                <p class="fr-callout__title fr-text--xl fr-mb-1w">
                  Lien administrateur
                </p>
                <p class="fr-callout__text fr-text--md fr-mb-2w">
                  Ce lien vous permet de modifier l’audit, ne le partagez pas.
                  <strong
                    >Pensez-bien à le sauvegarder, c’est le seul moyen de
                    reprendre l’édition de votre audit</strong
                  >.
                </p>
                <div class="fr-mb-2w copy-block">
                  <a
                    class="fr-link"
                    :href="link"
                    title="lien d’administration de l’audit"
                  >
                    {{ link }}
                  </a>
                  <button
                    class="fr-btn fr-m-0"
                    @click="copyLink"
                    @blur="hideCopyAlert"
                  >
                    Copier
                  </button>
                </div>
                <div role="alert" aria-live="polite">
                  <div
                    v-if="showCopyAlert"
                    class="fr-alert fr-alert--success fr-alert--sm fr-mb-2w"
                  >
                    <p>
                      Le lien d’administration de l’audit a bien été copié dans
                      le presse-papier.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div class="fr-modal__footer">
              <ul
                class="fr-btns-group fr-btns-group--right fr-btns-group--inline-reverse fr-btns-group--inline-lg fr-btns-group--icon-left"
              >
                <li>
                  <button
                    class="fr-btn fr-btn--secondary"
                    @click="$emit('close')"
                  >
                    C’est fait
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

<style scoped>
.copy-block {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 1rem;
}
</style>
