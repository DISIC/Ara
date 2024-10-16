<script setup lang="ts">
import { useIsOffline } from "../../composables/useIsOffline";
import LazyAccordion from "./LazyAccordion.vue";
import MarkdownHelpButton from "./MarkdownHelpButton.vue";

defineProps<{ id: string; comment: string | null }>();

defineEmits<{
  (e: "update:comment", payload: string): void;
}>();

const isOffline = useIsOffline();

const title = "Commentaire";
</script>

<template>
  <LazyAccordion :title="title" disclose-color="var(--background-default-grey)">
    <!-- COMMENT -->
    <div class="fr-input-group fr-mb-1w">
      <label class="fr-label fr-sr-only" :for="`criterum-comment-field-${id}`">
        {{ title }}
      </label>
      <textarea
        :id="`criterum-comment-field-${id}`"
        :value="comment ?? ''"
        class="fr-mt-0 fr-input"
        rows="5"
        :disabled="isOffline"
        :aria-describedby="`markdown-notice-${id}`"
        @input="
          $emit('update:comment', ($event.target as HTMLTextAreaElement).value)
        "
      ></textarea>
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
