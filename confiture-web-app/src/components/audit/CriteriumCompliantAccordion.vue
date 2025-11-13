<script setup lang="ts">
import RichTextEditor from "../tiptap/RichTextEditor.vue";
import LazyAccordion from "./LazyAccordion.vue";

defineProps<{
  id: string;
  comment: string | null;
}>();

defineEmits<{
  (e: "update:comment", payload: string): void;
}>();

const title = "Points d’amélioration";
</script>

<template>
  <LazyAccordion :title="title" disclose-color="var(--background-default-grey)">
    <RichTextEditor
      :model-value="comment"
      :label="title"
      description="Décrivez les erreurs, proposez une correction et ajoutez une image pour illustrer l’erreur ou la correction. Taille maximale par image : 2 Mo. Tout format d’image accepté."
      @update:model-value="$emit('update:comment', $event)"
    />
  </LazyAccordion>
</template>
