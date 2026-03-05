<script lang="ts" setup>
import { debounce } from "lodash-es";
import { computed, Ref, ref } from "vue";
import { useRoute } from "vue-router";

import { FileErrorMessage } from "../../enums";
import { useAuditStore } from "../../store/audit";
import { StoreName } from "../../types";
import { getUploadUrl, handleFileDeleteError, handleFileUploadError } from "../../utils";
import RichTextEditor from "../tiptap/RichTextEditor.vue";
import DsfrModal from "../ui/DsfrModal.vue";
import { FileListFile } from "../ui/FileList.vue";
import FileUpload from "../ui/FileUpload.vue";
import SaveIndicator from "./SaveIndicator.vue";

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
      auditStore.lastRequestFailed = true;
    })
    .finally(() => {
      fileUpload.value?.onFileRequestFinished();
    });
}

function onClosed() {
  fileUpload.value?.reset();
  emit("closed");
}

function handleDeleteFile(flFile: FileListFile) {
  const notesFile = files.value.find(f => f.key === flFile.key)!;
  auditStore
    .deleteAuditFile(uniqueId.value, notesFile.id)
    .then(() => {
      errorMessage.value = null;
    })
    .catch(async (error) => {
      errorMessage.value = await handleFileDeleteError(error);
      auditStore.lastRequestFailed = true;
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
    @closed="onClosed"
  >
    <form class="fr-container fr-container--fluid" @submit.prevent>
      <div class="fr-grid-row">
        <div class="fr-col-12 sidebar-col">
          <div class="fr-modal__body">
            <div class="fr-modal__content">
              <div class="sidebar-header">
                <button
                  class="fr-btn--close fr-btn fr-text--md"
                  aria-controls="notes-modal"
                  type="button"
                >Fermer</button>
                <div class="title-container">
                  <h1 id="notes-modal-title" class="fr-modal__title fr-pr-2w fr-mr-2w fr-mb-0">
                    Observations
                  </h1>
                  <SaveIndicator :store-name="StoreName.AUDIT_STORE" />
                </div>
                <p class="fr-text--xs fr-m-0 description">
                  Vos observations seront affichées dans le rapport d’audit.
                </p>
              </div>

              <RichTextEditor
                v-model="notes"
                type="notes"
                label="Points à signaler ne concernant pas l’accessibilité du site audité"
                description="Exemple : temps de chargement excessif sur certaines pages, incohérences dans l'usage des couleurs, bug"
                @update:model-value="handleNotesChange"
              />

              <!-- FILE -->
              <FileUpload
                ref="fileUpload"
                class="fr-mb-4w"
                :audit-files="files.map(f => ({
                  ...f,
                  filename: f.originalFilename,
                  url: getUploadUrl(f.key),
                  thumbnailUrl: f.thumbnailKey
                    ? getUploadUrl(f.thumbnailKey)
                    : undefined
                }))"
                :error-message="errorMessage"
                is-in-modal
                multiple
                :on-delete="handleDeleteFile"
                @upload-file="handleUploadFile"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  </DsfrModal>
</template>

<style scoped>
.fr-modal__content {
  padding-left: 3rem;
  padding-right: 3rem;
}

.sidebar-header {
  display: grid;
  grid-template-columns: auto auto;
  grid-template-rows: auto auto;
  align-items: unset;
  justify-content: unset;
  gap: 0.5rem 1rem;
  margin: 2rem 0 1.5rem 0;
  padding-top: 0.75rem;
  position: sticky;
  top: 0;
  z-index: 9;
  background-color: var(--background-lifted-grey);

  .title-container {
    display: flex;
    flex-basis: auto;
    align-items: center;
    grid-column: 1;
    grid-row: 1;

    h1 {
      border-right: 1px solid var(--border-default-grey);
    }

    p {
      color: var(--text-mention-grey);
    }
  }
}

@media (width < 36rem) {
  .sidebar-header {
    display: flex;
    flex-flow: row-reverse wrap;
    align-items: center;
    justify-content: start;

    .title-container {
      display: initial;
      flex-basis: 100%;
      flex-grow: 1;

      h1 {
        border-right: none;
      }
    }
  }
}
</style>
