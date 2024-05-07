<script lang="ts" setup>
import { debounce } from "lodash-es";
import { computed, ref } from "vue";
import { HTTPError } from "ky";
import { useRoute } from "vue-router";
import { captureWithPayloads } from "../../utils";

import { AuditFile } from "../../types";

import DsfrModal from "../ui/DsfrModal.vue";
import FileUpload from "../ui/FileUpload.vue";

import MarkdownHelpButton from "./MarkdownHelpButton.vue";
import { useIsOffline } from "../../composables/useIsOffline";
import { useNotifications } from "../../composables/useNotifications";
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

const showFileSizeError = ref(false);
const showFileFormatError = ref(false);

const auditStore = useAuditStore();
const notify = useNotifications();
const route = useRoute();

const modal = ref<InstanceType<typeof DsfrModal>>();
const isOffline = useIsOffline();

const notes = ref(auditStore.currentAudit?.notes || "");

const uniqueId = computed(() => route.params.uniqueId as string);
const files = computed(() => auditStore.currentAudit?.notesFiles || []);

const handleNotesChange = debounce(() => emit("confirm", notes.value), 500);

function handleUploadFile(file: File) {
  showFileSizeError.value = false;
  showFileFormatError.value = false;
  notify("info", "Chargement en cours");
  auditStore
    .uploadAuditFile(uniqueId.value, file)
    .then(() => {
      notify("success", "Fichier téléchargé avec succès.");
    })
    .catch(async (error) => {
      if (error instanceof HTTPError) {
        if (error.response.status === 413) {
          showFileSizeError.value = true;
          notify(
            "error",
            "Le téléchargement du fichier a échoué",
            "Poids du fichier trop lourd"
          );
        }

        // Unprocessable Entity
        if (error.response.status === 422) {
          const body = await error.response.json();

          if (body.message.includes("expected type")) {
            showFileFormatError.value = true;
            notify(
              "error",
              "Le téléchargement du fichier a échoué",
              "Format de fichier non supporté"
            );
          } else if (body.message.includes("expected size")) {
            showFileSizeError.value = true;
            notify(
              "error",
              "Le téléchargement du fichier a échoué",
              "Poids du fichier trop lourd"
            );
          } else {
            notify(
              "error",
              "Le téléchargement du fichier a échoué",
              "Une erreur inconnue est survenue"
            );
            captureWithPayloads(error);
          }
        } else {
          notify(
            "error",
            "Téléchargement échoué",
            "Une erreur inconnue est survenue"
          );
          captureWithPayloads(error);
        }
      }
    });
}

function handleDeleteFile(file: AuditFile) {
  auditStore
    .deleteAuditFile(uniqueId.value, file.id)
    .then(() => {
      showFileSizeError.value = false;
      showFileFormatError.value = false;
      notify("success", "Fichier supprimé avec succès");
    })
    .catch(() => {
      notify(
        "error",
        "Échec lors de la suppression du fichier",
        "Une erreur inconnue empêche la suppression du fichier."
      );
    });
}
</script>

<template>
  <DsfrModal
    id="notes-modal"
    ref="modal"
    aria-labelledby="notes-modal-title"
    class="modal-side-bar"
    @closed="$emit('closed')"
  >
    <form class="fr-container" @submit.prevent>
      <div class="fr-grid-row">
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
              <h1 id="notes-modal-title" class="fr-modal__title">
                Annoter l’audit
              </h1>
              <div class="fr-input-group fr-mb-1v">
                <label class="fr-label" for="audit-notes">
                  Remarques et recommandations générales
                </label>
                <textarea
                  id="audit-notes"
                  v-model="notes"
                  class="fr-input"
                  rows="10"
                  :disabled="isOffline"
                  aria-describedby="notes-markdown"
                  @input="handleNotesChange"
                ></textarea>
              </div>
              <MarkdownHelpButton
                :id="`markdown-notice-notes`"
                class="fr-mb-4w"
              />
              <!-- FILE -->
              <FileUpload
                class="fr-mb-4w"
                :disabled="isOffline"
                :audit-files="files"
                :multiple="true"
                :show-file-size-error="showFileSizeError"
                :show-file-format-error="showFileFormatError"
                @upload-file="handleUploadFile"
                @delete-file="handleDeleteFile"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  </DsfrModal>
</template>
