<script setup lang="ts">
import { useIsOffline } from "../../composables/useIsOffline";
import TiptapEditor from "../tiptap/TiptapEditor.vue";
import LazyAccordion from "./LazyAccordion.vue";

const props = defineProps<{ id: string; comment: string | null }>();

defineEmits<{
  (e: "update:comment", payload: string): void;
}>();

const isOffline = useIsOffline();

const title = "Commentaire";
</script>

<template>
  <LazyAccordion :title="title" disclose-color="var(--background-default-grey)">
    <template #title>
      {{ title }} (<strong v-if="!!props.comment">1</strong><template v-else>0</template>)
    </template>
    <!-- COMMENT -->
    <p :id="`criterum-comment-field-${id}`" class="fr-label fr-sr-only">
      {{ title }} ({{ Number(!!props.comment) }})
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
