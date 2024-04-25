<script setup lang="ts">
import { useIsOffline } from "../../composables/useIsOffline";
import { formatUserImpact } from "../../utils";

import { CriterionResultUserImpact, ExampleImage } from "../../types";
import FileUpload from "../ui/FileUpload.vue";
import LazyAccordion from "./LazyAccordion.vue";
import MarkdownHelpButton from "./MarkdownHelpButton.vue";
import { RadioColor } from "../ui/Radio.vue";
import RadioGroup from "../ui/RadioGroup.vue";

defineProps<{
  id: string;
  comment: string | null;
  userImpact: CriterionResultUserImpact | null;
  exampleImages: ExampleImage[];
  recommandation: string | null;
  quickWin?: boolean;

  showFileFormatError: boolean;
  showFileSizeError: boolean;
}>();

const emit = defineEmits<{
  (e: "update:comment", payload: string): void;
  (e: "update:userImpact", payload: CriterionResultUserImpact | null): void;
  (e: "upload-example", payload: File): void;
  (e: "delete-example", payload: ExampleImage): void;
  (e: "update:recommandation", payload: string): void;
  (e: "update:quickWin", payload: boolean): void;
}>();

const userImpacts: Array<{
  label: string;
  value: CriterionResultUserImpact;
  color?: RadioColor;
}> = [
  {
    value: CriterionResultUserImpact.MINOR,
    label: formatUserImpact(CriterionResultUserImpact.MINOR),
    color: "grey"
  },
  {
    value: CriterionResultUserImpact.MAJOR,
    label: formatUserImpact(CriterionResultUserImpact.MAJOR),
    color: "yellow"
  },
  {
    value: CriterionResultUserImpact.BLOCKING,
    label: formatUserImpact(CriterionResultUserImpact.BLOCKING),
    color: "red"
  }
];

function handleUploadImage(file: File) {
  emit("upload-example", file);
}

function handleDeleteImage(image: ExampleImage) {
  emit("delete-example", image);
}

const isOffline = useIsOffline();
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
        :disabled="isOffline"
        :aria-describedby="`markdown-notice-${id}`"
        @input="
          $emit('update:comment', ($event.target as HTMLTextAreaElement).value)
        "
      ></textarea>
    </div>

    <MarkdownHelpButton :id="`markdown-notice-${id}`" class="fr-mb-4w" />

    <!-- FILE -->
    <FileUpload
      class="fr-mb-4w"
      :disabled="isOffline"
      :example-images="exampleImages"
      :accepted-formats="['jpg', 'jpeg', 'png']"
      :multiple="true"
      title="Ajouter une image d’exemple de l’erreur"
      @upload-example="handleUploadImage"
      @delete-example="handleDeleteImage"
      @update:model-value="$emit('update:userImpact', $event)"
    />

    <!-- USER IMPACT -->
    <RadioGroup
      class="fr-mb-4w"
      :model-value="userImpact"
      :items="userImpacts"
      label="Impact sur l’usager"
      :default-value="null"
      :disabled="isOffline"
      @update:model-value="$emit('update:userImpact', $event)"
    />

    <!-- RECOMMANDATION -->
    <div class="fr-input-group fr-mb-1w">
      <label
        class="fr-label fr-text--bold"
        :for="`criterum-comment-field-recommendation-${id}`"
      >
        Recommandation de correction
      </label>
      <textarea
        :id="`criterum-comment-field-recommendation-${id}`"
        :value="recommandation ?? ''"
        class="fr-input"
        rows="5"
        :disabled="isOffline"
        :aria-describedby="`markdown-notice-${id}`"
        @input="
          $emit(
            'update:recommandation',
            ($event.target as HTMLTextAreaElement).value
          )
        "
      ></textarea>
    </div>

    <MarkdownHelpButton :id="`markdown-notice-${id}`" class="fr-mb-3w" />

    <!-- QUICK WIN -->
    <div class="fr-fieldset__element fr-fieldset__element--inline">
      <div class="fr-checkbox-group">
        <input
          :id="`criterium-quick-win-${id}`"
          :checked="quickWin"
          type="checkbox"
          @input="
            $emit(
              'update:quickWin',
              ($event.target as HTMLInputElement).checked
            )
          "
        />
        <label class="fr-label" :for="`criterium-quick-win-${id}`">
          Facile à corriger
        </label>
      </div>
    </div>
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
</style>
