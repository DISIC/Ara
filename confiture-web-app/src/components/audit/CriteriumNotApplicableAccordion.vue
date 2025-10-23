<script setup lang="ts">
import { computed } from "vue";
import { useIsOffline } from "../../composables/useIsOffline";
import TiptapEditor from "../tiptap/TiptapEditor.vue";
import LazyAccordion from "./LazyAccordion.vue";

const props = defineProps<{ id: string; comment: string | null }>();

defineEmits<{
  (e: "update:comment", payload: string): void;
}>();

const isOffline = useIsOffline();

const title = computed(() => {
  return `Commentaire (${Number(!!props.comment)})`;
});
</script>

<template>
  <LazyAccordion :title="title" disclose-color="var(--background-default-grey)">
    <!-- COMMENT -->
    <p :id="`criterum-comment-field-${id}`" class="fr-label fr-sr-only">
      {{ title }}
    </p>
    <TiptapEditor
      :key="id"
      :model-value="comment"
      :labelled-by="`criterum-comment-field-${id}`"
      :disabled="isOffline"
      @update:model-value="$emit('update:comment', $event)"
    />
  </LazyAccordion>
</template>
