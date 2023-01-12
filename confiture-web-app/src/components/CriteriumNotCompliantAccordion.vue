<script setup lang="ts">
import { ref } from "vue";
import { CriterionResultUserImpact, ExampleImage } from "../types";
import { formatBytes, formatUserImpact } from "../utils";
import LazyAccordion from "./LazyAccordion.vue";
import { RadioColor } from "./Radio.vue";
import RadioGroup from "./RadioGroup.vue";

defineProps<{
  id: string;
  comment: string | null;
  userImpact: CriterionResultUserImpact | null;
  exampleImages: ExampleImage[];
}>();

const emit = defineEmits<{
  (e: "update:comment", payload: string): void;
  (e: "update:userImpact", payload: CriterionResultUserImpact | null): void;
  (e: "upload-example", payload: File): void;
  (e: "delete-example", payload: ExampleImage): void;
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
</script>

<template>
  <LazyAccordion
    title="Description de l’erreur (optionnel)"
    disclose-color="var(--background-default-grey)"
  >
    <!-- COMMENT -->
    <div class="fr-input-group fr-mb-4w">
      <label class="fr-label sr-only" :for="`criterum-comment-field-${id}`">
        Description de l’erreur (optionnel)
      </label>
      <textarea
        :id="`criterum-comment-field-${id}`"
        :value="comment ?? ''"
        class="fr-mt-0 fr-input"
        rows="5"
        @input="
          $emit('update:comment', ($event.target as HTMLTextAreaElement).value)
        "
      ></textarea>
    </div>

    <!-- FILE -->
    <div class="fr-mb-4w upload-wrapper">
      <div :id="`file-upload-description-${id}`" class="fr-text--bold fr-label">
        Ajouter un exemple de l’erreur
        <span class="fr-mt-1v fr-text--regular fr-hint-text">
          Taille maximale par fichier : 1 Mo. Formats : jpg, png, pdf. Plusieurs
          fichiers possibles.
        </span>
      </div>

      <div class="upload-line">
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
          :aria-describedby="`file-upload-description-${id}`"
          @change="handleFileChange"
        />
      </div>
    </div>

    <!-- EXAMPLE IMAGES -->
    <ul class="example-images">
      <li v-for="image in exampleImages" :key="image.id">
        <img width="50" height="50" :src="image.url" alt="" />
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
          <!-- TODO: more explicit label -->
        </button>
      </li>
    </ul>

    <!-- USER IMPACT -->
    <RadioGroup
      :model-value="userImpact"
      :items="userImpacts"
      label="Impact sur l’usager"
      :default-value="null"
      @update:model-value="$emit('update:userImpact', $event)"
    />
  </LazyAccordion>
</template>

<style scoped>
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
