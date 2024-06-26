<script lang="ts" setup>
import { debounce } from "lodash-es";
import { computed, ref, Ref } from "vue";
import { useRoute } from "vue-router";
import { FileErrorMessage } from "../../enums";
import { handleFileUploadError, handleFileDeleteError } from "../../utils";

import { AuditFile } from "../../types";

import DsfrModal from "../ui/DsfrModal.vue";
import SaveIndicator from "./SaveIndicator.vue";
import FileUpload from "../ui/FileUpload.vue";

import MarkdownHelpButton from "./MarkdownHelpButton.vue";
import { useIsOffline } from "../../composables/useIsOffline";
import { useAuditStore } from "../../store/audit";
import { StoreName } from "../../types";

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

const errorMessage: Ref<FileErrorMessage | null> = ref(null);
const fileUpload = ref<InstanceType<typeof FileUpload>>();

const auditStore = useAuditStore();
const route = useRoute();

const modal = ref<InstanceType<typeof DsfrModal>>();
const isOffline = useIsOffline();

const notes = ref(auditStore.currentAudit?.notes || "");

const uniqueId = computed(() => route.params.uniqueId as string);
const files = computed(() => auditStore.currentAudit?.notesFiles || []);

const handleNotesChange = debounce(() => emit("confirm", notes.value), 500);

function handleUploadFile(file: File) {
  auditStore
    .uploadAuditFile(uniqueId.value, file)
    .then(() => {
      errorMessage.value = null;
    })
    .catch(async (error) => {
      errorMessage.value = await handleFileUploadError(error);
    })
    .finally(() => {
      fileUpload.value?.onFileRequestFinished();
    });
}

function handleDeleteFile(file: AuditFile) {
  auditStore
    .deleteAuditFile(uniqueId.value, file.id)
    .then(() => {
      errorMessage.value = null;
    })
    .catch(async (error) => {
      errorMessage.value = await handleFileDeleteError(error);
    })
    .finally(() => {
      fileUpload.value?.onFileRequestFinished();
    });
}
</script>

<template>
  <DsfrModal
    id="notes-modal"
    ref="modal"
    aria-labelledby="notes-modal-title"
    :is-sidebar="true"
    @closed="$emit('closed')"
  >
    <form class="fr-container fr-container--fluid" @submit.prevent>
      <div class="fr-grid-row">
        <div class="fr-col-12 sidebar-col">
          <div class="fr-modal__body">
            <div class="fr-modal__content">
              <div class="sidebar-header">
                <button
                  class="fr-btn--close fr-btn"
                  aria-controls="notes-modal"
                  type="button"
                >
                  Fermer
                </button>
                <div class="title-container">
                  <h1 id="notes-modal-title" class="fr-modal__title">
                    Annotations de l’audit
                  </h1>
                  <SaveIndicator :store-name="StoreName.AUDIT_STORE" />
                </div>
              </div>
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
                ref="fileUpload"
                class="fr-mb-4w"
                :disabled="isOffline"
                :audit-files="files"
                :multiple="true"
                :error-message="errorMessage"
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

<style scoped>
.sidebar-header {
  display: flex;
  flex-direction: row-reverse;
  flex-wrap: wrap;
  column-gap: 1rem;
  align-items: center;
  margin: var(--title-spacing);
  padding: 0.75rem 0;
  position: sticky;
  top: 0;
  z-index: 9;
  background-color: var(--background-lifted-grey);
}
.sidebar-header h1 {
  margin-bottom: 0;
  padding-right: 1rem;
  margin-right: 1rem;
}
.title-container {
  flex-basis: 100%;
}
@media (min-width: 36em) {
  .title-container {
    display: flex;
    flex-basis: auto;
    align-items: center;
  }
  .sidebar-header h1 {
    border-right: solid var(--border-default-grey);
  }
}
</style>
