<script lang="ts" setup>
import { computed, nextTick, ref, useId, useTemplateRef } from "vue";
import { useIsOffline } from "../../composables/useIsOffline";

import { useNotifications } from "../../composables/useNotifications";
import { getFileMessage } from "../../enums";
import { isImage } from "../../utils";
import FileList, { FileListFile } from "./FileList.vue";

interface Props {
  acceptedFormats?: Array<string>;
  flFiles: FileListFile[];
  maxFileSize?: number;
  multiple?: boolean;
  isInModal?: boolean;
  readonly?: boolean;
  title?: string | null;
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

const emit = defineEmits<{
  (e: "file-imported", payload: { resolve: (value: void) => void; file: File }): Promise<void>;
  (e: "file-deleted", payload: { resolve: (value: void) => void; flFile: FileListFile }): Promise<void>;
}>();

const fileInputRef = useTemplateRef("fileInputRef");
const fileListRef = useTemplateRef("fileListRef");

defineExpose({ reset, fileInputRef });

const message = ref<string>("");
const isDraggedOver = ref(false);

const id = useId();
const isOffline = useIsOffline();

const notify = useNotifications();

const maxFileSizeHumanReadable = computed(() => (props.maxFileSize / 1000000) + " Mo");

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

function reset() {
  if (fileInputRef.value) {
    fileInputRef.value.value = "";
  }
  message.value = "";
  fileListRef.value?.resetInlineConfirm();
}

async function handleFileChange() {
  // Errors that can be detected locally without requesting the server
  if (fileInputRef.value?.files && fileInputRef.value?.files[0]) {
    const file = fileInputRef.value?.files[0];
    if (file.size > props.maxFileSize) {
      if (isImage(file)) {
        notify("error", undefined, getFileMessage("UPLOAD_ERROR_SIZE_IMAGE", file.name));
      } else {
        notify("error", undefined, getFileMessage("UPLOAD_ERROR_SIZE", file.name));
      }
      return;
    }
    try {
      // Announce upload success to screen reader
      if (isImage(file)) {
        message.value = getFileMessage("UPLOAD_SUCCESS_IMAGE", file.name);
      } else {
        message.value = getFileMessage("UPLOAD_SUCCESS", file.name);
      }

      // Tell listeners that a file has been imported locally
      // Typical use case: upload the file to a server using useFileHandler
      await new Promise((resolve: (value: void) => void) => {
        emit("file-imported", { resolve, file });
      });
      await nextTick(); // usefull to make updated live regions work as expected
    } catch {
      console.error("Upload failed: ", file.name);
    }
  }
  if (fileInputRef.value) {
    fileInputRef.value.value = "";
  }
}

async function flOnDelete(
  resolve: (value: undefined) => void,
  flFile: FileListFile
) {
  // No need to tell which file has been correctly uploaded
  // after a file has just been deleted…
  message.value = "";

  await new Promise((resolve: (value: void) => void) => {
    emit("file-deleted", { resolve, flFile });
  });
  resolve(undefined);
}
</script>

<template>
  <div class="upload-wrapper">
    <div :id="`upload-input-wrapper-${id}`" class="upload-input-wrapper">
      <!-- TODO: handle multiple files upload -->
      <!-- :multiple="multiple ?? undefined" -->
      <div
        v-if="!readonly"
        class="fr-upload-group"
        :class="{ 'fr-upload-group--disabled': isOffline }"
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
          :aria-description="message ?? undefined"
          :class="{ 'file-upload--dragged-over': isDraggedOver }"
          :disabled="isOffline ? true : undefined"
          @click="() => fileListRef?.resetInlineConfirm()"
          @change="handleFileChange"
          @dragover="isDraggedOver = true"
          @dragleave="isDraggedOver = false"
          @drop="isDraggedOver = false"
        >
        <p
          :id="`file-upload-message-alert-${id}`"
          class="fr-sr-only"
          aria-live="polite"
          role="status"
        >{{ message }}</p>
      </div>
    </div>

    <!-- Uploaded files -->
    <FileList
      ref="fileListRef"
      :files="flFiles"
      :is-in-modal="isInModal"
      :readonly="readonly"
      @file-deleted="flOnDelete($event.resolve, $event.flFile)"
    />
  </div>
</template>

<style scoped>
.fr-upload-group .fr-label + .fr-upload {
  margin-block-start: 0.5rem;
  padding-block: 0.5rem;
}

.file-upload--dragged-over {
  outline: var(--dsfr-outline) dotted 3px;
}

.fr-message {
  white-space: pre;
}

.upload-input-wrapper {
  display: flex;
  flex-direction: column-reverse;
}
</style>
