<script lang="ts" setup>
import { debounce } from "lodash-es";
import { computed, ref } from "vue";
import { useRoute } from "vue-router";

import { useFileHandler } from "../../composables/useFileHandler";
import { useIsOffline } from "../../composables/useIsOffline";
import { useAuditStore } from "../../store/audit";
import { AuditFile, StoreName } from "../../types";
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
  show,
  hide
});

const fileUpload = ref<InstanceType<typeof FileUpload>>();

const auditStore = useAuditStore();
const fileHandler = useFileHandler();
const route = useRoute();

const modal = ref<InstanceType<typeof DsfrModal>>();
const isOffline = useIsOffline();

const notes = ref(auditStore.currentAudit?.notes || "");

const uniqueId = computed(() => route.params.uniqueId as string);
const files = computed(() => auditStore.currentAudit?.notesFiles || []);

const handleNotesChange = debounce(() => emit("confirm", notes.value), 500);

function show() {
  modal.value?.show();
}
function hide() {
  modal.value?.hide();
}

function onClosed() {
  fileUpload.value?.cleanMessages(true);
  emit("closed");
}

async function handleUploadFile(file: File) {
  await fileHandler.uploadGlobalFile(uniqueId.value, file);
}

async function handleDeleteFile(auditFile: AuditFile) {
  await fileHandler.deleteGlobalAuditFile(uniqueId.value, auditFile);
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
                :is-in-modal="true"
                :multiple="true"
                :on-upload="handleUploadFile"
                :on-delete="handleDeleteFile"
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
