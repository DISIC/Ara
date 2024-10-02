<script setup lang="ts">
import { computed } from "vue";

import { useIsOffline } from "../../composables/useIsOffline";
import { useAuditStore } from "../../store";
import LazyAccordion from "./LazyAccordion.vue";
import MarkdownHelpButton from "./MarkdownHelpButton.vue";

defineProps<{
  id: string;
  comment: string | null;
}>();

defineEmits<{
  (e: "update:comment", payload: string): void;
}>();

const isOffline = useIsOffline();

const auditStore = useAuditStore();

const transversePageId = computed(() => {
  return auditStore.currentAudit?.transverseElementsPage.id;
});

const title = computed(() => {
  return `Points d’amélioration${
    auditStore.currentPageId === transversePageId.value
      ? " sur toutes les pages"
      : ""
  }`;
});
</script>

<template>
  <LazyAccordion disclose-color="var(--background-default-grey)" :title="title">
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
