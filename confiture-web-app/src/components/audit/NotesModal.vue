<script lang="ts" setup>
import { debounce } from "lodash-es";
import { computed, Ref, ref } from "vue";
import { useRoute } from "vue-router";

import { useIsOffline } from "../../composables/useIsOffline";
import { FileErrorMessage } from "../../enums";
import { useAuditStore } from "../../store/audit";
import { AuditFile, StoreName } from "../../types";
import { handleFileDeleteError, handleFileUploadError } from "../../utils";
import TiptapEditor from "../tiptap/TiptapEditor.vue";
import DsfrModal from "../ui/DsfrModal.vue";
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
      auditStore.lastRequestFailed = true;
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
    @closed="$emit('closed')"
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
                  <h1 id="notes-modal-title" class="fr-modal__title">
                    Observations
                  </h1>
                  <SaveIndicator :store-name="StoreName.AUDIT_STORE" />
                </div>
                <p class="fr-text--xs fr-m-0 description">
                  Vos observations seront affichées dans le rapport d’audit.
                </p>
              </div>
              <p id="audit-notes" class="fr-label fr-mb-1w">
                Points à signaler ne concernant pas l’accessibilité du site
                audité
                <span class="fr-hint-text fr-mt-1v">Exemple : temps de chargement excessif sur certaines pages,
                  incohérences dans l'usage des couleurs, bug</span>
              </p>
              <TiptapEditor
                v-model="notes"
                class="fr-mb-4w"
                labelled-by="audit-notes"
                :disabled="isOffline"
                editor-size="lg"
                style="--tiptap-editor-height: 16.5rem"
                @update:model-value="handleNotesChange"
              />

              <!-- FILE -->
              <FileUpload
                ref="fileUpload"
                class="fr-mb-4w"
                :audit-files="files"
                :disabled="isOffline"
                :error-message="errorMessage"
                :multiple="true"
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
.fr-modal__content {
  padding-left: 3rem;
  padding-right: 3rem;
}

.sidebar-header {
  display: flex;
  flex-direction: row-reverse;
  flex-wrap: wrap;
  align-items: center;
  justify-content: start;
  gap: 0.5rem 1rem;
  margin: 2rem 0 1.5rem 0;
  padding-top: 0.75rem;
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

.sidebar-header p {
  color: var(--text-mention-grey);
}

.title-container {
  flex-basis: 100%;
  flex-grow: 1;
}

textarea {
  resize: vertical;
}

@media (min-width: 36rem) {
  .title-container {
    display: flex;
    flex-basis: auto;
    align-items: center;
  }

  .sidebar-header h1 {
    border-right: 1px solid var(--border-default-grey);
  }

  .sidebar-header {
    display: grid;
    grid-template-columns: auto auto;
    grid-template-rows: auto auto;
    align-items: unset;
    justify-content: unset;

    .title-container {
      grid-column: 1;
      grid-row: 1;
    }
  }
}
</style>
