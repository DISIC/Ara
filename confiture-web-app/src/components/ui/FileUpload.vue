<script lang="ts" setup>
import { computed, nextTick, Ref, ref, useId } from "vue";
import { useIsOffline } from "../../composables/useIsOffline";
import { useModal } from "../../composables/useModal";
import { getFileMessage } from "../../enums";
import { AuditFile } from "../../types";
import { formatBytes, getUploadUrl, sleep } from "../../utils";

interface Props {
  acceptedFormats?: Array<string>;
  auditFiles: AuditFile[];
  maxFileSize?: number;
  multiple?: boolean;
  isInModal?: boolean;
  readonly?: boolean;
  title?: string | null;
  onUpload?: (file: File, triggerButton?: EventTarget | null) => void;
  onDelete?: (file: AuditFile, triggerButton?: EventTarget | null) => void;
}

const props = withDefaults(defineProps<Props>(), {
  acceptedFormats: undefined,
  boldTitle: false,
  maxFileSize: 2000000,
  multiple: false,
  isInModal: false,
  readonly: false,
  title: null
});

defineExpose({
  cleanMessages
});

type MessageObj = {
  htmlContent: string | null;
  isSuccess: boolean | null;
};

const message: Ref<MessageObj> = ref(
  <MessageObj>{ htmlContent: null, isSuccess: null }
);
const isDraggedOver = ref(false);
const inlineConfirmPendingRange: Ref<number | undefined> = ref(undefined);

const id = useId();
const isOffline = useIsOffline();
const modal = useModal();

const fileInputRef = ref<HTMLInputElement>();
const messageRef = ref<HTMLParagraphElement>();
const deleteBtnRefs = ref<HTMLButtonElement[]>([]);
const deleteConfirmBtnRefs = ref<HTMLButtonElement[]>([]);

const maxFileSizeHumanReadable = computed(() => (props.maxFileSize / 1000000) + " Mo");

const isEmpty = computed(() => props.auditFiles.length <= 0);

const allFiles = computed(() => {
  if (props.readonly) {
    return undefined;
  }
  const len = props.auditFiles.length;
  if (len === 0) {
    return "Aucun fichier ajouté";
  } else if (len === 1) {
    return `${len} fichier déjà ajouté`;
  } else {
    return `${len} fichiers déjà ajoutés`;
  }
});

const acceptedFormatsHtml = computed(() => {
  if (!props.acceptedFormats) {
    return "Tous les formats sont pris en compte";
  } else {
    return "Fichiers supportés&#8239;: " + props.acceptedFormats.join(", ");
  }
});

const acceptedFormatsAttr = computed(() => {
  if (!props.acceptedFormats) {
    return undefined;
  } else {
    return props.acceptedFormats.map((e) => `.${e}`).join(",");
  }
});

const title = computed(() => {
  if (props.title) {
    return props.title;
  } else if (props.multiple) {
    return "Ajouter des fichiers";
  } else {
    return "Ajouter un fichier";
  }
});

const getRawMessage = computed(() => {
  const tmp = document.createElement("div");
  if (message.value.htmlContent) {
    tmp.innerHTML = message.value.htmlContent;
  }
  return tmp.textContent || "";
});

async function displayMessage(msg: MessageObj) {
  await nextTick();
  message.value = msg;
  await sleep(300);
  messageRef.value?.focus();
}

function cleanMessages(resetFileInput: boolean = false) {
  if (resetFileInput && fileInputRef.value) {
    fileInputRef.value.value = "";
  }
  message.value = { htmlContent: null, isSuccess: null };
  inlineConfirmPendingRange.value = undefined;
}

async function handleFileChange() {
  await nextTick();
  if (fileInputRef.value?.files && fileInputRef.value?.files[0]) {
    const file = fileInputRef.value?.files[0];
    if (file.size > props.maxFileSize) {
      displayMessage({
        htmlContent: getFileMessage("UPLOAD_ERROR_SIZE", file.name),
        isSuccess: false
      });
      return;
    }
    if (props.onUpload) {
      try {
        await props.onUpload(file);
        displayMessage({
          htmlContent: getFileMessage("UPLOAD_SUCCESS", file.name),
          isSuccess: true
        });
      } catch (error: unknown) {
        if (typeof (error) === "string") {
          displayMessage({
            htmlContent: error,
            isSuccess: false
          });
        }
      }
    }
  }
  cleanMessages(true);
}

async function handleFileDelete(
  auditFile: AuditFile,
  range: number
) {
  cleanMessages(true);
  if (props.isInModal) {
    handleFileDeleteInlineReveal(range);
  } else {
    handleFileDeleteWithModal(auditFile);
  }
}

async function handleFileDeleteWithModal(
  auditFile: AuditFile
) {
  const { isCanceled } = await modal.showConfirm({
    title: getDeleteModalTitle(auditFile),
    message: getDeleteModalMessage(auditFile),
    confirmLabel: getDeleteModalConfirmLabel(auditFile),
    focusOnConceal: () => fileInputRef.value!
  });
  if (!isCanceled) {
    return await deleteFile(auditFile);
  }
  // Note: when deletion is cancelled from the modal dialog, focus automatically
  // returns to the button that opened the modal dialog.
}

async function handleFileDeleteInlineReveal(
  range: number
) {
  inlineConfirmPendingRange.value = range;
  await nextTick();
  const confirmBtn = deleteConfirmBtnRefs.value[0];
  confirmBtn?.focus();
}

async function inlineDeleteConfirm(auditFile: AuditFile) {
  inlineConfirmPendingRange.value = undefined;
  const promise = await deleteFile(auditFile);
  return promise;
}

function inlineDeleteCancel(range: number) {
  const deleteBtn = deleteBtnRefs.value[range];
  deleteBtn.focus();
  inlineConfirmPendingRange.value = undefined;
}

async function deleteFile(
  auditFile: AuditFile
) {
  if (!props.onDelete) {
    return;
  }

  try {
    await props.onDelete(auditFile);
    displayMessage({
      htmlContent: getFileMessage("DELETE_SUCCESS", auditFile.originalFilename),
      isSuccess: true
    });
  } catch (error) {
    if (typeof (error) === "string") {
      displayMessage({
        htmlContent: error,
        isSuccess: false
      });
    }
  }
}

function getFileName(auditFile: AuditFile) {
  return auditFile.originalFilename;
}

function getFileDetails(auditFile: AuditFile) {
  const name = auditFile.originalFilename;
  const extension = name.substring(name.lastIndexOf(".") + 1).toUpperCase();
  return extension + " – " + formatBytes(auditFile.size);
}

function getFullFileName(auditFile: AuditFile) {
  return getFileName(auditFile) + " (" + getFileDetails(auditFile) + ")";
}

function isImage(auditFile: AuditFile) {
  return (
    auditFile.mimetype.startsWith("image")
  );
}

function isViewable(auditFile: AuditFile) {
  return (
    isImage(auditFile) || auditFile.mimetype.includes("pdf")
  );
}

function getDeleteModalTitle(auditFile: AuditFile) {
  return isImage(auditFile)
    ? `Voulez-vous supprimer l’image <strong>${getFileName(auditFile)}</strong> ?`
    : `Voulez-vous supprimer le fichier <strong>${getFileName(auditFile)})</strong> ?`;
};

/**
 * Gets the Delete Modal body message (HTML format)
 *
 * @param {AuditFile} auditFile The Auditfile being deleted
 * @returns {string} message in HTML format
 */
function getDeleteModalMessage(auditFile: AuditFile): string {
  return isImage(auditFile)
    ? `<p>L’image <strong>${getFileName(auditFile)}</strong> sera définitivement supprimée de votre audit.</p>`
    : `<p>Le fichier <strong>${getFileName(auditFile)}</strong> sera définitivement supprimé de votre audit.</p>`;
};

function getDeleteModalConfirmLabel(auditFile: AuditFile) {
  return isImage(auditFile) ? `Supprimer l’image<span class="fr-sr-only"> ${getFileName(auditFile)}</span>` : `Supprimer le fichier<span class="fr-sr-only"> ${getFileName(auditFile)}</span>`;
};
</script>

<template>
  <div>
    <div class="upload-wrapper">
      <div v-if="message.htmlContent" :id="`file-messages-${id}`" class="fr-messages-group">
        <p
          ref="messageRef"
          class="fr-message"
          tabindex="0"
          :aria-label="getRawMessage"
          :class="{
            'fr-message--error': (message.isSuccess === false),
            'fr-message--valid': (message.isSuccess === true)
          }" v-html="message.htmlContent"
        ></p>
      </div>
      <div :id="`upload-wrapper-${id}`">
        <!-- TODO: handle multiple files upload -->
        <!-- :multiple="multiple ?? undefined" -->
        <div
          v-if="!readonly" class="fr-upload-group" :class="{ 'fr-upload-group--disabled': isOffline }"
        >
          <label class="fr-label" :for="`file-upload-${id}`">
            {{ title }}
            <span class="fr-hint-text">Taille maximale par fichier&#8239;: {{ maxFileSizeHumanReadable }}.
              <span v-html="acceptedFormatsHtml"></span>.
            </span>
          </label>
          <input
            :id="`file-upload-${id}`"
            ref="fileInputRef"
            class="fr-upload"
            type="file"
            name="file-upload"
            :accept="acceptedFormatsAttr"
            :aria-describedby="message.htmlContent ? `file-messages-${id}` : undefined"
            :class="{ 'file-upload--dragged-over': isDraggedOver }"
            :disabled="isOffline ? true : undefined"
            @click="() => cleanMessages()"
            @change="handleFileChange"
            @dragover="isDraggedOver = true"
            @dragleave="isDraggedOver = false"
            @drop="isDraggedOver = false"
          >
        </div>
      </div>
    </div>

    <!-- Uploaded files -->
    <p v-if="!readonly" :aria-hidden="!isEmpty" class="fr-mt-3w fr-mb-0">{{ allFiles }}</p>
    <ul
      v-if="!isEmpty"
      class="files"
      role="list"
      :aria-label="allFiles"
      :aria-describedby="message.htmlContent ? `file-messages-${id}` : undefined"
    >
      <li v-for="(auditFile, i) in auditFiles" :key="auditFile.key">
        <img
          v-if="auditFile.thumbnailKey"
          class="fr-icon--lg file-thumbnail"
          :src="getUploadUrl(auditFile.thumbnailKey)"
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
          <span>{{ getFileName(auditFile) }}</span><br />
          <span class="fr-hint-text">{{ getFileDetails(auditFile) }}</span>
        </div>
        <ul class="fr-btns-group fr-btns-group--inline">
          <li v-if="isViewable(auditFile)">
            <a
              class="fr-btn fr-btn fr-btn--tertiary-no-outline fr-icon-eye-line fr-mb-0"
              :href="getUploadUrl(auditFile.key)"
              :disabled="isOffline ? true : undefined"
              target="_blank"
              :title="
                'Voir ' + getFullFileName(auditFile) + ' - nouvelle fenêtre'
              "
            >
              Voir
              <span class="fr-sr-only">{{ getFullFileName(auditFile) }}</span>
            </a>
          </li>
          <li>
            <a
              class="fr-btn fr-btn--tertiary-no-outline fr-icon-download-line fr-mb-0"
              download
              :href="getUploadUrl(auditFile.key)"
              :disabled="isOffline ? true : undefined"
              :title="'Télécharger ' + getFullFileName(auditFile)"
            >
              Télécharger
              <span class="fr-sr-only">{{ getFullFileName(auditFile) }}</span>
            </a>
          </li>
          <li v-if="!readonly">
            <button
              ref="deleteBtnRefs"
              class="fr-btn fr-btn--tertiary-no-outline fr-icon-delete-bin-line fr-mb-0"
              :disabled="isOffline ? true : undefined"
              :title="'Supprimer ' + getFullFileName(auditFile)"
              @click="handleFileDelete(auditFile, i)"
            >
              Supprimer
              <span class="fr-sr-only">{{ getFullFileName(auditFile) }}</span>
            </button>
          </li>
        </ul>
        <form v-if="inlineConfirmPendingRange === i" class="files__confirm-inline">
          <fieldset class="fr-fieldset">
            <legend class="fr-fieldset__legend" v-html="getDeleteModalTitle(auditFile)"></legend>
            <div class="fr-fieldset__element fr-fieldset__element--inline@sm">
              <div class="fr-btns-group fr-btns-group--right fr-btns-group--inline-reverse fr-btns-group--inline-sm fr-btns-group--icon-left">
                <button
                  ref="deleteConfirmBtnRefs"
                  class="fr-btn danger-button"
                  type="button"
                  @click="inlineDeleteConfirm(auditFile)"
                  v-html="getDeleteModalConfirmLabel(auditFile)"
                ></button>
                <button
                  class="fr-btn fr-btn--secondary" type="button"
                  @click="inlineDeleteCancel(i)"
                >
                  Annuler<span class="fr-sr-only"> la suppression de {{ getFullFileName(auditFile) }}</span>
                </button>
              </div>
            </div>
          </fieldset>
        </form>
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

.files__confirm-inline {
  width: 100%;
}

.fr-message {
  white-space: pre;
}

.upload-wrapper {
  display: flex;
  flex-direction: column-reverse;
}
</style>
