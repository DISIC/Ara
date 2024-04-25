<script lang="ts" setup>
import { computed, ref } from "vue";

import { useIsOffline } from "../../composables/useIsOffline";
import { useUniqueId } from "../../composables/useUniqueId";

import { ExampleImage } from "../../types";
import { formatBytes, getUploadUrl } from "../../utils";

export interface Props {
  acceptedFormats?: Array<string>;
  exampleImages: ExampleImage[];
  maxFileSize?: string;
  multiple?: boolean;
  title: string;
}

const props = withDefaults(defineProps<Props>(), {
  acceptedFormats: undefined,
  maxFileSize: "2 Mo",
  multiple: false,
  title: "Ajouter un fichier"
});

const emit = defineEmits<{
  (e: "upload-example", payload: File): void;
  (e: "delete-example", payload: ExampleImage): void;
}>();

const id = useUniqueId();
const isOffline = useIsOffline();
const fileInputRef = ref<HTMLInputElement>();

const showFileSizeError = ref(false);
const showFileFormatError = ref(false);

const selectedFiles = computed(() => {
  const len = props.exampleImages.length;
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
    emit("upload-example", fileInputRef.value?.files[0]);
    fileInputRef.value.value = "";
  }
}

function deleteImage(image: ExampleImage) {
  emit("delete-example", image);
}
</script>

<template>
  <div class="upload-wrapper">
    <div :id="`file-upload-description-${id}`" class="fr-text--bold fr-label">
      {{ title }}
      <span class="fr-mt-1v fr-text--regular fr-hint-text">
        <span
          >Taille maximale par fichier&#8239;: <b>{{ maxFileSize }}</b></span
        ><span> — <span v-html="acceptedFormatsHtml"></span></span>
        <span v-if="multiple"> — Plusieurs fichiers possibles.</span>
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

  <!-- EXAMPLE IMAGES -->
  <ul class="example-images">
    <li v-for="image in exampleImages" :key="image.id">
      <img
        width="50"
        height="50"
        :src="getUploadUrl(image.thumbnailKey)"
        alt=""
        loading="lazy"
      />
      <a
        class="fr-link"
        :href="getUploadUrl(image.key)"
        target="_blank"
        rel="noreferrer noopener"
      >
        {{ image.originalFilename }} ({{ formatBytes(image.size) }})
      </a>
      <button
        class="fr-btn fr-btn--tertiary-no-outline"
        :disabled="isOffline"
        @click="deleteImage(image)"
      >
        Supprimer
        <span class="sr-only">{{ image.originalFilename }}</span>
      </button>
    </li>
  </ul>
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

.example-images {
  list-style: none;
  padding: 0;
}

.example-images li {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding-bottom: 0.5rem;
}

.example-images li button {
  margin-left: auto;
}
</style>
