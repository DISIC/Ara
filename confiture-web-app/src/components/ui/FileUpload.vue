<script lang="ts" setup>
import { computed, Ref, ref } from "vue";

import { useIsOffline } from "../../composables/useIsOffline";
import { useUniqueId } from "../../composables/useUniqueId";
import { FileErrorMessage } from "../../enums";
import { AuditFile, NotesFile } from "../../types";
import { formatBytes, getUploadUrl } from "../../utils";

type ComponentFile = NotesFile | AuditFile;

export interface Props {
  acceptedFormats?: Array<string>;
  auditFiles: ComponentFile[];
  errorMessage?: FileErrorMessage | null;
  maxFileSize?: string;
  multiple?: boolean;
  readonly?: boolean;
  title?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  acceptedFormats: undefined,
  boldTitle: false,
  errorMessage: null,
  errorMessageTitle: null,
  maxFileSize: "2 Mo",
  multiple: false,
  readonly: false,
  title: null
});

const emit = defineEmits<{
  (e: "upload-file", payload: File): void;
  (e: "delete-file", payload: AuditFile): void;
}>();

defineExpose({ onFileRequestFinished });

const localErrorMessage: Ref<FileErrorMessage | null> = ref(null);
const isDraggedOver: Ref<boolean> = ref(false);

const id = useUniqueId();
const isOffline = useIsOffline();
const fileInputRef = ref<HTMLInputElement>();

const selectedFiles = computed(() => {
  const len = props.auditFiles.length;
  if (len === 0) {
    return "Aucun fichier ajouté.";
  } else if (len === 1) {
    return `${len} fichier ajouté.`;
  } else {
    return `${len} fichiers ajoutés.`;
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

const computedErrorMessage = computed(() => {
  if (props.errorMessage) {
    return props.errorMessage;
  } else if (localErrorMessage.value) {
    return localErrorMessage.value;
  } else {
    return null;
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

function cancelUpload() {
  if (fileInputRef.value) {
    fileInputRef.value.value = "";
  }
  resetMessage();
}

function resetMessage() {
  localErrorMessage.value = null;
}

function handleFileChange() {
  if (fileInputRef.value?.files && fileInputRef.value?.files[0]) {
    const file = fileInputRef.value?.files[0];
    if (file.size > 2000000) {
      localErrorMessage.value = FileErrorMessage.UPLOAD_SIZE;
      return;
    }
    emit("upload-file", file);
  }
}

function deleteFile(file: AuditFile) {
  emit("delete-file", file);
}

function getFileName(auditFile: ComponentFile) {
  return auditFile.originalFilename;
}

function getFullFileName(auditFile: ComponentFile) {
  return getFileName(auditFile) + " (" + getFileDetails(auditFile) + ")";
}

function getFileDetails(auditFile: ComponentFile) {
  const name = auditFile.originalFilename;
  const extension = name.substring(name.lastIndexOf(".") + 1).toUpperCase();
  return extension + " – " + formatBytes(auditFile.size);
}

function isViewable(auditFile: ComponentFile) {
  return (
    auditFile.mimetype.startsWith("image") || auditFile.mimetype.includes("pdf")
  );
}

function onFileRequestFinished() {
  localErrorMessage.value = null;
}
</script>

<template>
  <div>
    <div class="upload-wrapper">
      <!-- TODO: handle multiple files upload -->
      <!-- :multiple="multiple ?? undefined" -->
      <div
        v-if="!readonly" class="fr-upload-group" :class="{ 'fr-upload-group--disabled': isOffline }"
      >
        <label class="fr-label" :for="`file-upload-${id}`">
          {{ title }}
          <span class="fr-hint-text">Taille maximale par fichier&#8239;: {{ maxFileSize }}.
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
          :aria-describedby="`file-upload-messages-${id}`"
          :class="{ 'file-upload--dragged-over': isDraggedOver }"
          :disabled="isOffline"
          @input="resetMessage"
          @cancel="cancelUpload"
          @change="handleFileChange"
          @dragover="isDraggedOver = true"
          @dragleave="isDraggedOver = false"
          @drop="isDraggedOver = false"
        >
        <div :id="`file-upload-messages-${id}`" class="fr-messages-group" aria-live="assertive" aria-atomic="true">
          <p
            class="fr-message"
            :class="{ 'fr-message--error': computedErrorMessage }"
          >{{ computedErrorMessage }}</p>
        </div>
      </div>
    </div>

    <!-- Uploaded files -->
    <p class="fr-mt-3w fr-mb-0">{{ selectedFiles }}</p>
    <ul class="files">
      <li v-for="auditFile in auditFiles" :key="auditFile.key">
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
              :disabled="isOffline"
              target="_blank"
              :title="
                'Voir ' + getFullFileName(auditFile) + ' - nouvelle fenêtre'
              "
            >
              Voir
              <span class="sr-only">{{ getFullFileName(auditFile) }}</span>
            </a>
          </li>
          <li>
            <a
              class="fr-btn fr-btn--tertiary-no-outline fr-icon-download-line fr-mb-0"
              download
              :href="getUploadUrl(auditFile.key)"
              :disabled="isOffline"
              :title="'Télécharger ' + getFullFileName(auditFile)"
            >
              Télécharger
              <span class="sr-only">{{ getFullFileName(auditFile) }}</span>
            </a>
          </li>
          <li v-if="!readonly">
            <button
              class="fr-btn fr-btn--tertiary-no-outline fr-icon-delete-bin-line fr-mb-0"
              :disabled="isOffline"
              :title="'Supprimer ' + getFullFileName(auditFile)"
              @click="deleteFile(auditFile as AuditFile)"
            >
              Supprimer
              <span class="sr-only">{{ getFullFileName(auditFile) }}</span>
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
  word-break: break-word;
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
  margin-top: 0.5rem;
  padding-block: 0.5rem;
}
.file-upload--dragged-over {
  outline-style: dotted;
  outline-width: 3px;
  outline-color: var(--dsfr-outline);
}
</style>
