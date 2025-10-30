<script setup lang="ts">
import { ref } from "vue";
import { useIsOffline } from "../../composables/useIsOffline";
import TiptapEditor from "../tiptap/TiptapEditor.vue";
import LazyAccordion from "./LazyAccordion.vue";
import NewFeatureNotification, { imageUploadEditorLocalStorageKey } from "./NewFeatureNotification.vue";

defineProps<{
  id: string;
  comment: string | null;
}>();

defineEmits<{
  (e: "update:comment", payload: string): void;
}>();

const isOffline = useIsOffline();

const title = "Points d’amélioration";

// Handle alert to announce images in editor
// TODO: remove this in january 2026
const commentEditorRef = ref<InstanceType<typeof TiptapEditor>>();
const showNewFeatureNotification =
  ref(!localStorage.getItem(imageUploadEditorLocalStorageKey));

function closeNotification() {
  showNewFeatureNotification.value = false;
  commentEditorRef.value?.focusEditor();
}
</script>

<template>
  <LazyAccordion disclose-color="var(--background-default-grey)" :title="title">
    <!-- TODO: remove this in january 2026  -->
    <NewFeatureNotification v-if="showNewFeatureNotification" class="fr-mb-5v" @close="closeNotification" />

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
