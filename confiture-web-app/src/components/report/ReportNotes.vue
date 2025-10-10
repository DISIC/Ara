<script lang="ts" setup>
import { computed } from "vue";

import { useReportStore } from "../../store";
import { isTiptapDocumentEmpty, getUploadUrl } from "../../utils";
import TiptapRenderer from "../tiptap/TiptapRenderer.vue";
import FileList from "../ui/FileList.vue";

const report = useReportStore();

const files = computed(() => report.data?.notesFiles.map(f => ({
  size: f.size,
  thumbnailUrl: f.thumbnailKey ? getUploadUrl(f.thumbnailKey) : undefined,
  filename: f.originalFilename,
  mimetype: f.mimetype,
  url: getUploadUrl(f.key),
  key: f.key
})));
</script>

<template>
  <h2 class="fr-sr-only">Observations</h2>
  <TiptapRenderer
    v-if="report.data?.notes && !isTiptapDocumentEmpty(report.data?.notes)"
    :document="report.data?.notes"
  />

  <template v-if="files?.length">
    <h3 class="fr-text--sm">Pièces jointes</h3>
    <FileList
      class="fr-mb-4w"
      readonly
      :files="files"
    />
  </template>
</template>
<style scoped>
h3 {
  color: var(--text-mention-grey);
  font-weight: unset;
}
</style>
