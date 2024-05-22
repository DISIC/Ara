<script lang="ts" setup>
import { computed, ref } from "vue";

import { useIsOffline } from "../../composables/useIsOffline";
import { useUniqueId } from "../../composables/useUniqueId";

import { AuditFile } from "../../types";
import { formatBytes, getUploadUrl } from "../../utils";

export interface Props {
  acceptedFormats?: Array<string>;
  auditFiles: AuditFile[];
  maxFileSize?: string;
  multiple?: boolean;
  title?: string;
  showFileFormatError?: boolean;
  showFileSizeError?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  acceptedFormats: undefined,
  maxFileSize: "2 Mo",
  multiple: false,
  title: "Ajouter un fichier",
  showFileFormatError: false,
  showFileSizeError: false
});

const emit = defineEmits<{
  (e: "upload-file", payload: File): void;
  (e: "delete-file", payload: AuditFile): void;
}>();

const id = useUniqueId();
const isOffline = useIsOffline();
const fileInputRef = ref<HTMLInputElement>();

const selectedFiles = computed(() => {
  const len = props.auditFiles.length;
  if (len === 0) {
    return "Aucun fichier sélectionné.";
  } else if (len === 1) {
    return `${len} fichier sélectionné.`;
  } else {
    return `${len} fichiers sélectionnés.`;
  }
});

const acceptedFormatsHtml = computed(() => {
  if (!props.acceptedFormats) {
    return "Tous les formats sont pris en compte";
  } else {
    return (
      "Fichiers supportés&#8239;:" +
      props.acceptedFormats.map((e) => `<b>${e}</b>`).join(", ")
    );
  }
});

const acceptedFormatsAttr = computed(() => {
  if (!props.acceptedFormats) {
    return undefined;
  } else {
    return props.acceptedFormats.map((e) => `.${e}`).join(",");
  }
});

function handleFileChange() {
  if (fileInputRef.value?.files && fileInputRef.value?.files[0]) {
    emit("upload-file", fileInputRef.value?.files[0]);
    fileInputRef.value.value = "";
  }
}

function deleteFile(file: AuditFile) {
  emit("delete-file", file);
}

function getFileName(auditFile: AuditFile) {
  return auditFile.originalFilename + " ( " + formatBytes(auditFile.size) + ")";
}

function isViewable(auditFile: AuditFile) {
  return (
    auditFile.mimetype.startsWith("image") || auditFile.mimetype.includes("pdf")
  );
}
</script>

<template>
  <div>
    <div class="upload-wrapper">
      <div :id="`file-upload-description-${id}`" class="fr-text--bold fr-label">
        {{ title }}
        <span class="fr-mt-1v fr-text--regular fr-hint-text">
          <span>Taille maximale par fichier&#8239;: {{ maxFileSize }}</span
          ><span>. <span v-html="acceptedFormatsHtml"></span></span>
          <span v-if="multiple">. Plusieurs fichiers possibles.</span>
        </span>
      </div>

      <div class="upload-line fr-mt-2w fr-mb-2w">
        <label
          class="fr-btn fr-btn--tertiary upload-label"
          :class="{ 'upload-label--disabled': isOffline }"
          :for="`file-upload-${id}`"
        >
          Choisir un fichier
        </label>

        <!-- TODO: handle multiple files upload -->
        <!-- :multiple="multiple ?? undefined" -->
        <input
          :id="`file-upload-${id}`"
          ref="fileInputRef"
          class="sr-only"
          type="file"
          :accept="acceptedFormatsAttr"
          :disabled="isOffline"
          :aria-describedby="`file-upload-description-${id} file-upload-error-format-${id} file-upload-error-size-${id}`"
          @change="handleFileChange"
        />

        <p class="fr-mb-0 fr-ml-2w">{{ selectedFiles }}</p>
      </div>

      <p
        v-if="showFileFormatError"
        :id="`file-upload-error-format-${id}`"
        class="fr-error-text fr-mt-0"
      >
        Format de fichier non supporté.
      </p>

      <p
        v-if="showFileSizeError"
        :id="`file-upload-error-size-${id}`"
        class="fr-error-text fr-mt-0"
      >
        Poids du fichier trop lourd.
      </p>
    </div>

    <!-- Audit files -->
    <ul class="files">
      <li v-for="auditFile in auditFiles" :key="auditFile.id">
        <img
          v-if="auditFile.thumbnailKey"
          class="fr-icon--lg file-thumbnail"
          :src="getUploadUrl(auditFile.thumbnailKey)"
          alt=""
          loading="lazy"
        />
        <span
          v-else
          class="fr-icon--lg file-thumbnail__default fr-icon-file-text-line"
          loading="lazy"
        >
        </span>
        <div class="file-link">
          {{ getFileName(auditFile) }}
        </div>
        <ul class="fr-btns-group fr-btns-group--inline">
          <li v-if="isViewable(auditFile)">
            <a
              class="fr-btn fr-btn fr-btn--tertiary-no-outline fr-icon-eye-line fr-mb-0"
              :href="getUploadUrl(auditFile.key)"
              :disabled="isOffline"
              target="_blank"
              :title="'Voir ' + getFileName(auditFile) + ' - nouvelle fenêtre'"
            >
              Voir
              <span class="sr-only">{{ auditFile.originalFilename }}</span>
            </a>
          </li>
          <li>
            <a
              class="fr-btn fr-btn--tertiary-no-outline fr-icon-download-line fr-mb-0"
              download
              :href="getUploadUrl(auditFile.key)"
              rel="noreferrer noopener"
              :disabled="isOffline"
              :title="'Télécharger ' + getFileName(auditFile)"
            >
              Télécharger
              <span class="sr-only">{{ getFileName(auditFile) }}</span>
            </a>
          </li>
          <li>
            <button
              class="fr-btn fr-btn--tertiary-no-outline fr-icon-delete-bin-line fr-mb-0"
              :disabled="isOffline"
              :title="
                'Supprimer ' + getFileName(auditFile) + ' - nouvelle fenêtre'
              "
              @click="deleteFile(auditFile)"
            >
              Supprimer
              <span class="sr-only">{{ getFileName(auditFile) }}</span>
            </button>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.upload-label {
  cursor: pointer;
  outline-color: var(--dsfr-outline);
  outline-offset: 2px;
  outline-width: 2px;
  outline-style: none;
}

.upload-label--disabled {
  background: var(--background-disabled-grey);
  color: var(--text-disabled-grey);
  cursor: not-allowed;
}

@supports selector(:has(p)) {
  .upload-wrapper:has(:focus-visible):focus-within .upload-label {
    outline-style: solid;
  }
}

@supports not (selector(:has(p))) {
  .upload-wrapper:focus-within .upload-label {
    outline-style: solid;
  }
}

.upload-label:not(.upload-label--disabled):hover {
  background-color: var(--hover-tint);
}

.upload-label:not(.upload-label--disabled):active {
  background-color: var(--active-tint);
}

.upload-line {
  display: flex;
  align-items: center;
}

.files {
  padding: 0;
  list-style: bullet;
  width: fit-content;
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
}

.file-thumbnail,
.file-thumbnail__default {
  --thumbnail-size: 4.5rem;
  color: var(--artwork-motif-grey);
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
  --icon-size: 3rem;
}
</style>
