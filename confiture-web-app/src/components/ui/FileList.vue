<script setup lang="ts">
import { computed, ref } from "vue";
import { useDialog } from "../../composables/useDialog";
import { useIsOffline } from "../../composables/useIsOffline";
import { formatBytes, pluralize, sleep } from "../../utils";

export interface FileListFile {
  filename: string;
  size: number;
  mimetype: string;
  url: string;
  thumbnailUrl?: string;
  key: string;
}

const { files, isInModal, onDelete } = defineProps<{
  files: FileListFile[];
  readonly?: boolean;
  isInModal?: boolean;
  onDelete?: (flFile: FileListFile, triggerButton?: EventTarget | null) => void;
}>();

const isOffline = useIsOffline();
const dialog = useDialog();

const fileBtnsRefs = ref<HTMLLIElement[]>([]);

const selectedFiles = computed(() => {
  const len = files.length;
  if (len === 0) {
    return "Aucun fichier ajouté.";
  } else {
    return pluralize(len + " fichier ajouté", len + " fichiers ajoutés", len);
  }
});

async function handleFileDelete(
  flFile: FileListFile,
  range: number
) {
  if (isInModal) {
    deleteFile(flFile);
  } else {
    handleFileDeleteWithModal(flFile, range);
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
    }
  });

  // Note: when deletion is cancelled from the modal dialog, focus automatically
  // returns to the button that opened the modal dialog.
}

async function deleteFile(
  flFile: FileListFile
) {
  if (!onDelete) {
    return;
  }

  try {
    await onDelete(flFile);
    await sleep(300);
  } catch (error) {
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
    ? `Voulez-vous vraiment supprimer cette image ?`
    : `Voulez-vous vraiment supprimer ce fichier ?`;
};

function getDeleteModalMessage(flFile: FileListFile) {
  return isImage(flFile)
    ? `L’image <strong>${getFileName(flFile)}</strong> sera définitivement supprimée de votre audit.`
    : `Le fichier <strong>${getFileName(flFile)}</strong> sera définitivement supprimé de votre audit.`;
};

function getDeleteModalConfirmLabel(flFile: FileListFile) {
  return isImage(flFile) ?
    `Supprimer l’image<span class="fr-sr-only"> ${getFileName(flFile)}</span>`
    : `Supprimer le fichier<span class="fr-sr-only"> ${getFileName(flFile)}</span>`;
};

function getElementToFocusAfterDelete(range: number): HTMLElement | null {
  let focusElement;

  // if it exists, focus the item at following range
  focusElement = fileBtnsRefs.value.find(
    (btn) => Number(btn.dataset.range) === range + 1
  )?.querySelector(".fr-icon-delete-bin-line") as HTMLElement;
  if (focusElement) {
    return focusElement;
  }

  // if it exists, focus the item at the preceding range
  focusElement = fileBtnsRefs.value.find(
    (btn) => Number(btn.dataset.range) === range - 1
  )?.querySelector(".fr-icon-delete-bin-line") as HTMLElement;
  if (focusElement) {
    return focusElement;
  }

  // Should never happen
  console.error("Nothing to focus on modal dialog conceal");
  return null;
}
</script>

<template>
  <div>
    <p class="fr-mt-3w fr-mb-0">{{ selectedFiles }}</p>
    <ul class="files">
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
          <span>{{ file.filename }}</span><br />
          <span class="fr-hint-text">{{ getFileDetails(file) }}</span>
        </div>
        <ul class="fr-btns-group fr-btns-group--inline">
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
              :disabled="isOffline"
              :title="`Supprimer ${getFullFileName(file)}`"
              type="button"
              @click="handleFileDelete(file, i)"
            >
              Supprimer
              <span class="sr-only">{{ getFullFileName(file) }}</span>
            </button>
          </li>
        </ul>
      </li>
    </ul>
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
  gap: 1.5rem;
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
</style>
