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

const title = "Commentaire";
</script>

<template>
  <LazyAccordion :title="title" disclose-color="var(--background-default-grey)">
    <RichTextEditor
      type="criterium"
      :model-value="comment"
      :label="title"
      description="Vous pouvez ajouter une remarque si nécessaire."
      @update:model-value="$emit('update:comment', $event)"
    />
  </LazyAccordion>
</template>
