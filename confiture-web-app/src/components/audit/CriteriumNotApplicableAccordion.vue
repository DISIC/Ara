<script setup lang="ts">
import { useIsOffline } from "../../composables/useIsOffline";
import LazyAccordion from "./LazyAccordion.vue";
import MarkdownHelpButton from "./MarkdownHelpButton.vue";

defineProps<{ id: string; comment: string | null }>();

defineEmits<{
  (e: "update:comment", payload: string): void;
}>();

const isOffline = useIsOffline();
</script>

<template>
  <LazyAccordion
    title="Commentaire"
    disclose-color="var(--background-default-grey)"
  >
    <template #title>
      <slot name="title">
        Commentaire sur&nbsp;<strong>cette page</strong>
      </slot>
    </template>
    <!-- COMMENT -->
    <div class="fr-input-group fr-mb-1w">
      <label class="fr-label sr-only" :for="`criterum-comment-field-${id}`">
        Commentaire
      </label>
      <textarea
        :id="`criterum-comment-field-${id}`"
        :value="comment ?? ''"
        class="fr-mt-0 fr-input"
        rows="5"
        :disabled="isOffline"
        :aria-describedby="`markdown-notice-${id}`"
        @input="
          $emit('update:comment', ($event.target as HTMLTextAreaElement).value)
        "
      ></textarea>
    </div>

    <MarkdownHelpButton :id="`markdown-notice-${id}`" />

    <!-- FILE -->
    <!-- <div class="fr-upload-group">
      <label class="fr-text--bold fr-label" :for="`file-upload-${id}`">
        Ajouter un exemple
        <span class="fr-mt-1v fr-text--regular fr-hint-text">
          Taille maximale par fichier : 1 Mo, formats : jpg, png, pdf
        </span>
      </label>
      <input :id="`file-upload-${id}`" class="fr-upload" type="file" />
    </div> -->
  </LazyAccordion>
</template>

<style scoped>
.markdown-notice {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
