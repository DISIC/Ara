<script setup lang="ts">
import { useIsOffline } from "../../composables/useIsOffline";
import TiptapEditor from "../tiptap/TiptapEditor.vue";
import LazyAccordion from "./LazyAccordion.vue";

defineProps<{
  id: string;
  comment: string | null;
}>();

defineEmits<{
  (e: "update:comment", payload: string): void;
}>();

const isOffline = useIsOffline();

const title = "Points d’amélioration";
</script>

<template>
  <LazyAccordion disclose-color="var(--background-default-grey)" :title="title">
    <!-- COMMENT -->
    <p :id="`criterum-comment-field-${id}`" class="fr-label fr-sr-only">
      {{ title }}
    </p>
    <p data-image-success-message class="fr-sr-only" aria-live="polite"></p>
    <p :id="`criterium-comment-field-description-${id}`" class="fr-text--xs fr-mb-1w editor-description">Décrivez les erreurs, proposez une correction et ajoutez une image pour illustrer l’erreur ou la correction. Taille maximale par image : 2 Mo. Tout format d’image accepté.</p>
    <TiptapEditor
      :key="id"
      :model-value="comment"
      :labelled-by="`criterum-comment-field-${id}`"
      :described-by="`criterium-comment-field-description-${id}`"
      :disabled="isOffline"
      @update:model-value="$emit('update:comment', $event)"
    />
  </LazyAccordion>
</template>

<style scoped>
.editor-description {
  color: var(--text-mention-grey);
}
</style>
