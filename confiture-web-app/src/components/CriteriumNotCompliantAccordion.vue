<script setup lang="ts">
import { ref, computed } from "vue";
import { CriterionResultUserImpact, ExampleImage } from "../types";
import { formatBytes, formatUserImpact } from "../utils";
import LazyAccordion from "./LazyAccordion.vue";
import { RadioColor } from "./Radio.vue";
import RadioGroup from "./RadioGroup.vue";
import MarkdownHelpButton from "./MarkdownHelpButton.vue";

const props = defineProps<{
  id: string;
  comment: string | null;
  userImpact: CriterionResultUserImpact | null;
  exampleImages: ExampleImage[];
  recommandation: string | null;

  showFileFormatError: boolean;
  showFileSizeError: boolean;
}>();

const emit = defineEmits<{
  (e: "update:comment", payload: string): void;
  (e: "update:userImpact", payload: CriterionResultUserImpact | null): void;
  (e: "upload-example", payload: File): void;
  (e: "delete-example", payload: ExampleImage): void;
  (e: "update:recommandation", payload: string): void;
}>();

const userImpacts: Array<{
  label: string;
  value: CriterionResultUserImpact;
  color?: RadioColor;
}> = [
  {
    value: CriterionResultUserImpact.MINOR,
    label: formatUserImpact(CriterionResultUserImpact.MINOR),
    color: "grey",
  },
  {
    value: CriterionResultUserImpact.MAJOR,
    label: formatUserImpact(CriterionResultUserImpact.MAJOR),
    color: "yellow",
  },
  {
    value: CriterionResultUserImpact.BLOCKING,
    label: formatUserImpact(CriterionResultUserImpact.BLOCKING),
    color: "red",
  },
];

const fileInputRef = ref<HTMLInputElement>();

function handleFileChange() {
  if (fileInputRef.value?.files && fileInputRef.value?.files[0]) {
    emit("upload-example", fileInputRef.value?.files[0]);
    fileInputRef.value.value = "";
  }
}

function deleteImage(image: ExampleImage) {
  emit("delete-example", image);
}

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
</script>

<template>
  <LazyAccordion
    title="Description et recommandation"
    disclose-color="var(--background-default-grey)"
  >
    <!-- COMMENT -->
    <div class="fr-input-group fr-mb-1w">
      <label
        class="fr-label fr-text--bold"
        :for="`criterum-comment-field-${id}`"
      >
        Description de la ou des erreurs
      </label>
      <textarea
        :id="`criterum-comment-field-${id}`"
        :value="comment ?? ''"
        class="fr-input"
        rows="5"
        :aria-describedby="`markdown-notice-${id}`"
        @input="
          $emit('update:comment', ($event.target as HTMLTextAreaElement).value)
        "
      ></textarea>
    </div>

    <MarkdownHelpButton :id="`markdown-notice-${id}`" class="fr-mb-4w" />

    <!-- FILE -->
    <div class="fr-mb-4w upload-wrapper">
      <div :id="`file-upload-description-${id}`" class="fr-text--bold fr-label">
        Ajouter un exemple de l’erreur
        <span class="fr-mt-1v fr-text--regular fr-hint-text">
          Taille maximale par fichier : 2 Mo. Formats : jpg, png. Plusieurs
          fichiers possibles.
        </span>
      </div>

      <div class="upload-line fr-mt-2w fr-mb-2w">
        <label
          class="fr-btn fr-btn--tertiary upload-label"
          :for="`file-upload-${id}`"
        >
          Choisir un fichier
        </label>

        <input
          :id="`file-upload-${id}`"
          ref="fileInputRef"
          class="sr-only"
          type="file"
          accept="image/*"
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
          :src="image.thumbnailUrl"
          alt=""
          loading="lazy"
        />
        <a
          class="fr-link"
          :href="image.url"
          target="_blank"
          rel="noreferrer noopener"
        >
          {{ image.originalFilename }} ({{ formatBytes(image.size) }})
        </a>
        <button
          class="fr-btn fr-btn--tertiary-no-outline"
          @click="deleteImage(image)"
        >
          Supprimer
          <span class="sr-only">{{ image.originalFilename }}</span>
        </button>
      </li>
    </ul>

    <!-- USER IMPACT -->
    <RadioGroup
      class="fr-mb-4w"
      :model-value="userImpact"
      :items="userImpacts"
      label="Impact sur l’usager"
      :default-value="null"
      @update:model-value="$emit('update:userImpact', $event)"
    />

    <!-- RECOMMANDATION -->
    <div class="fr-input-group fr-mb-1w">
      <label
        class="fr-label fr-text--bold"
        :for="`criterum-comment-field-${id}`"
      >
        Recommendation de correction
      </label>
      <textarea
        :id="`criterum-comment-field-${id}`"
        :value="recommandation ?? ''"
        class="fr-input"
        rows="5"
        :aria-describedby="`markdown-notice-${id}`"
        @input="
          $emit(
            'update:recommandation',
            ($event.target as HTMLTextAreaElement).value
          )
        "
      ></textarea>
    </div>

    <MarkdownHelpButton :id="`markdown-notice-${id}`" />
  </LazyAccordion>
</template>

<style scoped>
.markdown-notice {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-impact-container {
  border: none;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.upload-label {
  cursor: pointer;
  outline-color: #0a76f6;
  outline-offset: 2px;
  outline-width: 2px;
  outline-style: none;
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

.upload-label:not(:disabled):hover {
  background-color: var(--hover-tint);
}

.upload-label:not(:disabled):active {
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
