<script lang="ts" setup>
import { computed } from "vue";

import { useReportStore } from "../../store";
import { isTiptapDocumentEmpty } from "../../utils";
import TiptapRenderer from "../tiptap/TiptapRenderer.vue";
import FileUpload from "../ui/FileUpload.vue";

const report = useReportStore();

const files = computed(() => report.data?.notesFiles);
</script>

<template>
  <h2 class="fr-sr-only">Observations</h2>
  <TiptapRenderer
    v-if="report.data?.notes && !isTiptapDocumentEmpty(report.data?.notes)"
    :document="report.data?.notes"
  />

  <h3 v-if="files?.length" class="fr-text--sm">Pièces jointes</h3>
  <FileUpload
    v-if="files"
    class="fr-mb-4w"
    :readonly="true"
    :audit-files="files"
    :multiple="true"
  />
</template>
<style scoped>
h3 {
  color: var(--text-mention-grey);
  font-weight: unset;
}
</style>
