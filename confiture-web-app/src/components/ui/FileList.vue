<script setup lang="ts">
import { computed, inject, nextTick, ref, Ref, shallowRef, useId } from "vue";
import { useDialog } from "../../composables/useDialog";
import { useIsOffline } from "../../composables/useIsOffline";
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

const fileBtnsRefs = ref<HTMLLIElement[]>([]);
const deleteConfirmBtnRefs = ref<HTMLButtonElement[]>([]);

const successMessage = shallowRef<string>("");

const allFiles = computed(() => {
  if (readonly) {
    return undefined;
  }
  const len = files.length;
  if (len === 0) {
    return "Aucun fichier ajouté";
  } else if (len === 1) {
    return `${len} fichier ajouté`;
  } else {
    return `${len} fichiers ajoutés`;
  }
});

const isEmpty = computed(() => files.length <= 0);
const displayAllFiles = computed(() => {
  return !readonly && !(isEmpty.value && deleteOnly);
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
  const elementToFocus = getElementToFocusAfterDelete(range);
  await deleteFile(flFile);
  if (elementToFocus) {
    elementToFocus.focus();
  }
}

function resetInlineConfirm() {
  inlineConfirmPendingRange.value = undefined;
  successMessage.value = "";
}

function inlineDeleteCancel(range: number) {
  const deleteBtn = fileBtnsRefs.value.find(
    (btn) => Number(btn.dataset.range) === range
  )?.querySelector(".fr-icon-delete-bin-line") as HTMLElement;
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

    // Notify to screen reader
    if (isImage(flFile)) {
      successMessage.value = getFileMessage("DELETE_SUCCESS_IMAGE", flFile.filename);
    } else {
      successMessage.value = getFileMessage("DELETE_SUCCESS", flFile.filename);
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

function getDeleteModalConfirmLabel(flFile: FileListFile) {
  return isImage(flFile) ?
    `Supprimer l’image<span class="fr-sr-only"> ${getFileName(flFile)}</span>`
    : `Supprimer le fichier<span class="fr-sr-only"> ${getFileName(flFile)}</span>`;
};

function getElementToFocusAfterDelete(range: number): HTMLElement | null {
  let focusElement;

  // if it exists, focus the item at the preceding range
  focusElement = fileBtnsRefs.value.find(
    (btn) => Number(btn.dataset.range) === range - 1
  )?.querySelector(".fr-icon-delete-bin-line") as HTMLElement;
  if (focusElement) {
    return focusElement;
  }

  // if it exists, focus the item at following range
  focusElement = fileBtnsRefs.value.find(
    (btn) => Number(btn.dataset.range) === range + 1
  )?.querySelector(".fr-icon-delete-bin-line") as HTMLElement;
  if (focusElement) {
    return focusElement;
  }

  if (focusOnDelete) {
    focusOnDelete();

    return null;
  }

  // otherwise (if list will become empty), focus the given getFocusOnEmpty prop
  if (getFocusWhenListEmpty) {
    focusElement = getFocusWhenListEmpty();
    if (focusElement) {
      return focusElement;
    }
  }

  // Should never happen
  console.error("Nothing to focus on modal dialog conceal");
  return null;
}
</script>

<template>
  <div>
    <p v-if="displayAllFiles" :aria-hidden="!isEmpty" class="fr-mt-3w fr-mb-0">{{ allFiles }}</p>
    <ul
      v-if="!isEmpty"
      class="files"
      role="list"
      :aria-label="allFiles"
      :aria-describedby="successMessage ? `file-delete-message-${id}` : undefined"
    >
      <li v-for="(file, i) in files" :key="file.url" ref="fileBtnsRefs" :data-range="i">
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
              class="fr-btn fr-btn--tertiary-no-outline fr-icon-delete-bin-line fr-mb-0"
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
        <form v-if="inlineConfirmPendingRange === i" class="files__confirm-inline">
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
      </li>
    </ul>
    <p
      :id="`file-delete-message-${id}`"
      class="fr-sr-only"
      aria-live="polite"
      role="status"
    >{{ successMessage }}</p>
  </div>
</template>

<style scoped>
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

.files__confirm-inline,
.files__confirm-inline .fr-fieldset__element {
  width: 100%;
}

.files__confirm-inline {
  border-top: 1px solid var(--border-default-grey);
  padding-top: 1rem;
}
</style>
