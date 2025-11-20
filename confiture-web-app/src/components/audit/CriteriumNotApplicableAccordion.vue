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

const title = computed(() => {
  return `Commentaire (${Number(!isTiptapDocumentEmpty(props.comment))})`;
});
</script>

<template>
  <!-- <template #title>
    {{ title }} (<strong v-if="isFilledIn">1</strong><template v-else>0</template>)
  </template> -->
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
