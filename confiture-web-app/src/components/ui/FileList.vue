<script setup lang="ts">
import { computed } from "vue";
import { useIsOffline } from "../../composables/useIsOffline";
import { formatBytes, pluralize } from "../../utils";

export interface FileListFile {
  filename: string;
  size: number;
  mimetype: string;
  url: string;
  thumbnailUrl?: string;
  key: string;
}

const { files } = defineProps<{
  files: FileListFile[];
  readonly?: boolean;
}>();

const isOffline = useIsOffline();

const selectedFiles = computed(() => {
  const len = files.length;
  if (len === 0) {
    return "Aucun fichier ajouté.";
  } else {
    return pluralize(len + " fichier ajouté", len + " fichiers ajoutés", len);
  }
});

defineEmits<{
  delete: [key: FileListFile["key"]];
}>();

function isViewable(file: FileListFile) {
  return (
    file.mimetype.startsWith("image") || file.mimetype.includes("pdf")
  );
}

function getFileDetails(filename: string, size: number) {
  const extension = filename.substring(filename.lastIndexOf(".") + 1).toUpperCase();
  return extension + " – " + formatBytes(size);
}

function getFullFileName(file: FileListFile) {
  return file.filename + " (" + getFileDetails(file.filename, file.size) + ")";
}
</script>

<template>
  <div>
    <p class="fr-mt-3w fr-mb-0">{{ selectedFiles }}</p>
    <ul class="files">
      <li v-for="file in files" :key="file.url">
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
          <span class="fr-hint-text">{{ getFileDetails(file.filename, file.size) }}</span>
        </div>
        <ul class="fr-btns-group fr-btns-group--inline">
          <li v-if="isViewable(file)">
            <a
              class="fr-btn fr-btn fr-btn--tertiary-no-outline fr-icon-eye-line fr-mb-0"
              :href="file.url"
              :disabled="isOffline"
              target="_blank"
              :title="
                `Voir ${getFullFileName(file)} – nouvelle fenêtre`
              "
            >
              Voir
              <span class="sr-only">{{ getFullFileName(file) }}</span>
            </a>
          </li>
          <li>
            <a
              class="fr-btn fr-btn--tertiary-no-outline fr-icon-download-line fr-mb-0"
              download
              :href="file.url"
              :disabled="isOffline"
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
              @click="$emit('delete', file.key)"
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
