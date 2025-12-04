<script setup lang="ts">
import { computed } from "vue";

import { isTiptapDocumentEmpty } from "../../utils";
import RichTextEditor from "../tiptap/RichTextEditor.vue";
import LazyAccordion from "./LazyAccordion.vue";

const props = defineProps<{
  id: string;
  comment: string | null;
}>();

defineEmits<{
  (e: "update:comment", payload: string): void;
}>();

const baseTitle = "Points d’amélioration";
const title = computed(() => {
  return `${baseTitle} (${Number(!isTiptapDocumentEmpty(props.comment))})`;
});
</script>

<template>
  <LazyAccordion disclose-color="var(--background-default-grey)">
    <template #title>
      {{ baseTitle }}<strong v-if="!isTiptapDocumentEmpty(props.comment)"> (1)</strong><template v-else> (0)</template>
    </template>
    <RichTextEditor
      type="criterium"
      :model-value="comment"
      :label="title"
      description="Vous pouvez ajouter une remarque si nécessaire."
      @update:model-value="$emit('update:comment', $event)"
    />
  </LazyAccordion>
</template>
