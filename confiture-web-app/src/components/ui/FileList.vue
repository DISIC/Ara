<script setup lang="ts">
import { computed, inject, nextTick, ref, Ref, shallowRef, useId, useTemplateRef } from "vue";
import { useDialog } from "../../composables/useDialog";
import { useIsOffline } from "../../composables/useIsOffline";
import { useNotifications } from "../../composables/useNotifications";
import { getFileMessage } from "../../enums";
import { getFocusWhenListEmptyKey } from "../../types";
import { formatBytes, sleep } from "../../utils";

export interface FileListFile {
  filename: string;
  key: string;
  mimetype: string;
  size: number;
  thumbnailUrl?: string;
  url: string;
}

const {
  deleteOnly,
  files,
  isInModal,
  readonly,
  focusOnDelete
} = defineProps<{
  deleteOnly?: boolean;
  files: FileListFile[];
  isInModal?: boolean;
  readonly?: boolean;
  onDelete?: (flFile: FileListFile, triggerButton?: EventTarget | null) => void;
  focusOnDelete?: () => void;
}>();

defineExpose({
  resetInlineConfirm
});

const emit = defineEmits<{
  (e: "file-deleted", payload: { resolve: (value: void) => void; flFile: FileListFile }): Promise<void>;
}>();

const getFocusWhenListEmpty = inject(getFocusWhenListEmptyKey);

const inlineConfirmPendingRange: Ref<number | undefined> = ref(undefined);

const id = useId();
const isOffline = useIsOffline();
const dialog = useDialog();
const notify = useNotifications();

const deteleBtnRefs = useTemplateRef("deteleBtnRefs");
const deleteConfirmBtnRefs = ref<HTMLButtonElement[]>([]);

const successMessage = shallowRef<string>("");

const allFilesLabel = computed(() => {
  const len = files.length;
  if (len === 0) {
    return readonly ? "Aucune pièce jointe ajoutée" : "Aucun fichier ajouté";
  } else if (len === 1) {
    return readonly ? "Une pièce jointe" : "Un fichier ajouté";
  } else {
    return readonly ? `${len} pièces jointes` : `${len} fichiers ajoutés`;
  }
});

const isEmpty = computed(() => files.length <= 0);
const displayAllFiles = computed(() => {
  // Do not display in readonly mode
  if (readonly) {
    return false;
  }

  // Do not display if empty AND in deleteOnly mode (old images in criteria)
  if (deleteOnly && isEmpty.value) {
    return false;
  }

  // OPtherwise display it
  return true;
});

async function handleFileDeleteInlineReveal(
  range: number
) {
  inlineConfirmPendingRange.value = range;
  await nextTick();
  await sleep(1);
  const confirmBtn = deleteConfirmBtnRefs.value[0];
  confirmBtn?.focus();
}

async function inlineDeleteConfirm(flFile: FileListFile, range: number) {
  resetInlineConfirm();
  await sleep(200);
  const elementToFocus = getElementToFocusAfterDelete(range);
  await deleteFile(flFile);
  if (elementToFocus) {
    await sleep(500);
    elementToFocus.focus();
    // Notify to screen reader
    if (isImage(flFile)) {
      successMessage.value = getFileMessage("DELETE_SUCCESS_IMAGE", flFile.filename);
    } else {
      successMessage.value = getFileMessage("DELETE_SUCCESS", flFile.filename);
    }
  }
}

function resetInlineConfirm() {
  inlineConfirmPendingRange.value = undefined;
  successMessage.value = "";
}

function inlineDeleteCancel(range: number) {
  const deleteBtn = deteleBtnRefs.value?.find(
    (btn) => Number(btn.dataset.range) === range
  );
  if (deleteBtn) {
    deleteBtn.focus();
  }
  inlineConfirmPendingRange.value = undefined;
}

async function handleFileDelete(
  flFile: FileListFile,
  range: number
) {
  resetInlineConfirm();
  successMessage.value = "";
  if (isInModal) {
    await handleFileDeleteInlineReveal(range);
  } else {
    await handleFileDeleteWithModal(flFile, range);
  }
}

async function handleFileDeleteWithModal(
  flFile: FileListFile,
  range: number
) {
  await dialog.showConfirm({
    title: getDeleteModalTitle(flFile),
    message: getDeleteModalMessage(flFile),
    cancelLabel: getDeleteModalCancelLabel(flFile),
    confirmLabel: getDeleteModalConfirmLabel(flFile),
    confirmAction: {
      cb: () => deleteFile(flFile),
      focus: () => getElementToFocusAfterDelete(range)
    },
    titleIcon: "fr-icon-warning-line"
  });

  // Note: when deletion is cancelled from the modal dialog, focus automatically
  // returns to the button that opened the modal dialog.
}

async function deleteFile(flFile: FileListFile) {
  try {
    await new Promise((resolve: (value: void) => void) => {
      emit("file-deleted", { resolve, flFile });
    });
    // At this point the file has been properly handled (uploaded)

    if (!isInModal) {
      // Notify success with toast
      if (isImage(flFile)) {
        notify("success", undefined, getFileMessage("DELETE_SUCCESS_IMAGE", flFile.filename));
      } else {
        notify("success", undefined, getFileMessage("DELETE_SUCCESS", flFile.filename));
      }
    }
  } catch {
    console.error("File delete fail: " + flFile.filename);
  }
}

function getFileName(flFile: FileListFile) {
  return flFile.filename;
}

function getFileDetails(flFile: FileListFile) {
  const name = flFile.filename;
  const extension = name.substring(name.lastIndexOf(".") + 1).toUpperCase();
  return extension + " – " + formatBytes(flFile.size);
}

function getFullFileName(flFile: FileListFile) {
  return getFileName(flFile) + " (" + getFileDetails(flFile) + ")";
}

function isImage(flFile: FileListFile) {
  return (
    flFile.mimetype.startsWith("image")
  );
}

function isViewable(flFile: FileListFile) {
  return (
    isImage(flFile) || flFile.mimetype.includes("pdf")
  );
}

function getDeleteModalTitle(flFile: FileListFile) {
  return isImage(flFile)
    ? `Supprimer l’image « ${flFile.filename} » ?`
    : `Supprimer le fichier ?`;
};

function getDeleteModalMessage(flFile: FileListFile) {
  return isImage(flFile)
    ? `L’image sera définitivement supprimée.`
    : `Le fichier <strong>${getFileName(flFile)}</strong> sera définitivement supprimé.`;
};

function getDeleteModalCancelLabel(flFile: FileListFile) {
  return isImage(flFile) ?
    `Annuler<span class="fr-sr-only">, ne pas supprimer l’image ${getFileName(flFile)}</span>`
    : `Annuler<span class="fr-sr-only">, ne pas supprimer le fichier ${getFileName(flFile)}</span>`;
}

function getDeleteModalConfirmLabel(flFile: FileListFile) {
  return isImage(flFile) ?
    `Supprimer l’image<span class="fr-sr-only"> ${getFileName(flFile)}</span>`
    : `Supprimer le fichier<span class="fr-sr-only"> ${getFileName(flFile)}</span>`;
};

function getElementToFocusAfterDelete(range: number): HTMLElement | null {
  let focusElement;

  // if it exists, focus the item at following range
  focusElement = deteleBtnRefs.value?.find(
    (btn) => Number(btn.dataset.range) === range + 1
  );
  if (focusElement) {
    return focusElement;
  }

  // if it exists, focus the item at the preceding range
  focusElement = deteleBtnRefs.value?.find(
    (btn) => Number(btn.dataset.range) === range - 1
  );
  if (focusElement) {
    return focusElement;
  }

  // otherwise (if list will become empty), focus the given getFocusOnEmpty prop
  if (getFocusWhenListEmpty) {
    focusElement = getFocusWhenListEmpty();
    if (focusElement) {
      return focusElement;
    }
  }

  if (focusOnDelete) {
    focusOnDelete();

    return null;
  }

  // Should never happen
  console.error("Nothing to focus on modal dialog conceal");
  return null;
}
</script>

<template>
  <div>
    <p v-if="displayAllFiles" :aria-hidden="true" class="fr-mt-3w fr-mb-0">{{ allFilesLabel }}</p>
    <TransitionGroup
      v-if="!isEmpty"
      tag="ul"
      name="files"
      class="files"
      role="list"
      :aria-label="allFilesLabel"
      :aria-describedby="successMessage ? `file-delete-message-${id}` : undefined"
    >
      <li v-for="(file, i) in files" :key="file.url">
        <img
          v-if="file.thumbnailUrl"
          class="fr-icon--lg file-thumbnail"
          :src="file.thumbnailUrl"
          alt=""
          loading="lazy"
          width="80"
          height="80"
        />
        <span
          v-else
          class="fr-icon--lg file-thumbnail__default fr-icon-file-text-line"
          loading="lazy"
        >
        </span>
        <div class="file-link">
          <span>{{ getFileName(file) }}</span><br />
          <span class="fr-hint-text">{{ getFileDetails(file) }}</span>
        </div>
        <ul
          class="fr-btns-group fr-btns-group--inline"
        >
          <li v-if="isViewable(file)">
            <a
              class="fr-btn fr-btn fr-btn--tertiary-no-outline fr-icon-eye-line fr-mb-0"
              :href="file.url"
              :disabled="isOffline ? true : undefined"
              target="_blank"
            >
              Voir
              <span class="fr-sr-only">{{ getFullFileName(file) }} (nouvelle fenêtre)</span>
            </a>
          </li>
          <li>
            <a
              class="fr-btn fr-btn--tertiary-no-outline fr-icon-download-line fr-mb-0"
              download
              :href="file.url"
              :disabled="isOffline ? true : undefined"
              :title="`Télécharger ${getFullFileName(file)}`"
            >
              Télécharger
              <span class="sr-only">{{ getFullFileName(file) }}</span>
            </a>
          </li>
          <li v-if="!readonly">
            <button
              ref="deteleBtnRefs"
              class="fr-btn fr-btn--tertiary-no-outline fr-icon-delete-bin-line fr-mb-0"
              :data-range="i"
              :disabled="isOffline ? true : undefined"
              :title="`Supprimer ${getFullFileName(file)}`"
              type="button"
              @click="handleFileDelete(file, i)"
            >
              Supprimer
              <span class="sr-only">{{ getFullFileName(file) }}</span>
            </button>
          </li>
        </ul>
        <Transition name="inline-confirm">
          <form v-if="inlineConfirmPendingRange === i" class="inline-confirm">
            <fieldset class="fr-fieldset fr-mb-0">
              <legend class="fr-fieldset__legend fr-text--lg" v-html="getDeleteModalTitle(file)"></legend>
              <div class="fr-fieldset__element fr-fieldset__element--inline fr-mb-0">
                <div class="fr-btns-group fr-btns-group--right fr-btns-group--inline-reverse fr-btns-group--inline-sm fr-btns-group--icon-left">
                  <button
                    ref="deleteConfirmBtnRefs"
                    class="fr-btn"
                    type="button"
                    @click="inlineDeleteConfirm(file, i)"
                    v-html="getDeleteModalConfirmLabel(file)"
                  ></button>
                  <button
                    class="fr-btn fr-btn--secondary"
                    type="button"
                    @click="inlineDeleteCancel(i)"
                  >
                    Annuler<span class="fr-sr-only"> la suppression de {{ getFullFileName(file) }}</span>
                  </button>
                </div>
              </div>
            </fieldset>
          </form>
        </Transition>
      </li>
    </TransitionGroup>
    <p
      :id="`file-delete-message-${id}`"
      class="fr-sr-only"
      aria-live="polite"
      role="status"
    >{{ successMessage }}</p>
  </div>
</template>

<style scoped>
/* Transition */
.files-move,
.files-enter-active,
.files-leave-active {
  transition:
    opacity 0.5s ease,
    transform 0.5s ease;
}

.files-leave-active {
  position: absolute;
}

.files-enter-from,
.files-leave-to {
  opacity: 0;
  transform: translateY(-2.375rem);
}

.files {
  padding: 0;
  list-style: bullet;
  width: 39rem; /* 6 columns */
  min-width: 50%;
  max-width: 100%;
}

.files > li {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.5rem;
  align-items: center;
  padding: 0.75rem;
  border: 1px solid var(--artwork-motif-grey);
  position: relative;
}

.files > li + li {
  margin-top: 1rem;
}

.file-link {
  flex-basis: 33%;
  flex-grow: 1;
  word-break: normal;
}

.file-thumbnail,
.file-thumbnail__default {
  --thumbnail-size: 3rem;

  color: var(--artwork-motif-grey);
  background-color: var(--background-alt-blue-france);
  width: var(--thumbnail-size);
  height: var(--thumbnail-size);
  min-width: var(--thumbnail-size);
  min-height: var(--thumbnail-size);
  max-width: 100%;
  object-fit: contain;
}

.file-thumbnail__default {
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--text-label-blue-france);
  background-color: var(--background-alt-blue-france);
}

.file-thumbnail__default::before {
  --icon-size: 2.5rem;
}

.fr-upload-group .fr-label + .fr-upload {
  margin-block-start: 0.5rem;
  padding-block: 0.5rem;
}

.file-upload--dragged-over {
  outline: var(--dsfr-outline) dotted 3px;
}

/* Transition */
.inline-confirm-move,
.inline-confirm-enter-active,
.inline-confirm-leave-active {
  transition:
    opacity 0.5s ease,
    transform 0.5s ease;
}

.inline-confirm-enter-from,
.inline-confirm-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}

.inline-confirm,
.inline-confirm .fr-fieldset__element {
  width: 100%;
}

.inline-confirm {
  border-top: 1px solid var(--border-default-grey);
  padding-top: 1rem;
}
</style>
