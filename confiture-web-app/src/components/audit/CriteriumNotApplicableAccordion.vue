<script setup lang="ts">
import { useIsOffline } from "../../composables/useIsOffline";
import { UploadFn } from "../../tiptap/ImageUploadTiptapExtension";
import Tiptap from "../ui/Tiptap.vue";
import LazyAccordion from "./LazyAccordion.vue";
import MarkdownHelpButton from "./MarkdownHelpButton.vue";

export interface Props {
  id: string;
  comment: string | null;
  uploadFn: UploadFn;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: "update:comment", payload: string): void;
}>();

const isOffline = useIsOffline();

const title = "Commentaire";

function handleCommentChange(commentContent: string) {
  emit("update:comment", commentContent);
}
</script>

<template>
  <LazyAccordion :title="title" disclose-color="var(--background-default-grey)">
    <!-- COMMENT -->
    <div class="fr-input-group fr-mb-1w">
      <p :id="`criterum-comment-label-${id}`" class="fr-label fr-sr-only">
        {{ title }}
      </p>
      <tiptap
        ref="commentFieldRef"
        :content="comment"
        :labelled-by="`criterum-comment-label-${id}`"
        :disabled="isOffline"
        :upload-fn="uploadFn"
        @update:content="handleCommentChange"
      />
    </div>

    <MarkdownHelpButton :id="`markdown-notice-${id}`" />
  </LazyAccordion>
</template>

<style scoped>
.markdown-notice {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
