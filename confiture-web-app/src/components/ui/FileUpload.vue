<script lang="ts" setup>
import { computed, nextTick, Ref, ref, useId, useTemplateRef } from "vue";

import { useIsOffline } from "../../composables/useIsOffline";
import { FileErrorMessage } from "../../enums";
import { sleep } from "../../utils";
import FileList, { FileListFile } from "./FileList.vue";

export interface Props {
  acceptedFormats?: Array<string>;
  auditFiles: FileListFile[];
  errorMessage?: FileErrorMessage | null;
  maxFileSize?: string;
  multiple?: boolean;
  isInModal?: boolean;
  readonly?: boolean;
  title?: string | null;
  onUpload?: (file: File, triggerButton?: EventTarget | null) => void;
  onDelete?: (flFile: FileListFile, triggerButton?: EventTarget | null) => void;
}

const props = withDefaults(defineProps<Props>(), {
  acceptedFormats: undefined,
  boldTitle: false,
  errorMessage: null,
  errorMessageTitle: null,
  isInModal: false,
  maxFileSize: "2 Mo",
  multiple: false,
  readonly: false,
  title: null
});

defineEmits<{
  (e: "upload-file", payload: File): void;
  (e: "delete-file", payload: FileListFile): void;
}>();

const fileInputRef = useTemplateRef("fileInputRef");

defineExpose({ reset, fileInputRef });

const localErrorMessage: Ref<FileErrorMessage | null> = ref(null);
const isDraggedOver = ref(false);

const id = useId();
const isOffline = useIsOffline();

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

const computedErrorMessage = computed(() =>
  props.errorMessage ?? localErrorMessage.value ?? null);

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

function reset() {
  if (fileInputRef.value) {
    fileInputRef.value.value = "";
  }
  resetMessage();
}

function resetMessage() {
  localErrorMessage.value = null;
}

async function handleFileChange() {
  if (fileInputRef.value?.files && fileInputRef.value?.files[0]) {
    const file = fileInputRef.value?.files[0];
    if (file.size > 2000000) {
      localErrorMessage.value = FileErrorMessage.UPLOAD_SIZE;
      return;
    }
    if (props.onUpload) {
      try {
        // message.value = getFileMessage("UPLOAD_SUCCESS", file.name);
        await nextTick();
        await sleep(1);
        await props.onUpload(file);
      } catch {
        console.error("Upload failed: ", file.name);
      }
    }
  }
  if (fileInputRef.value) {
    fileInputRef.value.value = "";
  }
}
</script>

<template>
  <div>
    <div class="upload-wrapper">
      <!-- TODO: handle multiple files upload -->
      <!-- :multiple="multiple ?? undefined" -->
      <div
        v-if="!readonly"
        class="fr-upload-group"
        :class="{ 'fr-upload-group--disabled': isOffline }"
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
            v-if="computedErrorMessage"
            class="fr-message"
            :class="{ 'fr-message--error': computedErrorMessage }"
          >{{ computedErrorMessage }}</p>
        </div>
      </div>
    </div>

    <!-- Uploaded files -->
    <FileList
      :readonly="readonly"
      :files="auditFiles"
      :is-in-modal="isInModal"
      :on-delete="onDelete"
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
</style>
