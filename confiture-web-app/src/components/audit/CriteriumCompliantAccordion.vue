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
    <TiptapEditor
      :model-value="comment"
      :labelled-by="`criterum-comment-field-${id}`"
      :disabled="isOffline"
      @update:model-value="$emit('update:comment', $event)"
    />
  </LazyAccordion>
</template>
