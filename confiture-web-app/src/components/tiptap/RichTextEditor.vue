<script lang="ts" setup>
import { ref, useId } from "vue";

import { useIsOffline } from "../../composables/useIsOffline";
import NewFeatureNotification from "../audit/NewFeatureNotification.vue";
import TiptapEditor from "./TiptapEditor.vue";

defineOptions({
  inheritAttrs: false
});

defineProps<{
  modelValue: string | null;
  label: string;
  description: string;
  showLabel?: boolean;
}>();

defineEmits(["update:comment"]);

defineExpose({
  focusEditor: () => {
    richTextEditorRef.value?.focusEditor();
  }
});

const isOffline = useIsOffline();
const uniqueId = useId();

const richTextEditorRef = ref<InstanceType<typeof TiptapEditor>>();

function closeNotification() {
  richTextEditorRef.value?.focusEditor();
}

const uploadSuccess = ref("");

// Announce upload success to screen readers
function announceUploadSuccess(fileName: string) {
  if (fileName === "external") {
    uploadSuccess.value = "L’image a été correctement insérée";
  } else {
    uploadSuccess.value = `L’image « ${fileName} » a été correctement insérée`;
  }

  setTimeout(() => {
    uploadSuccess.value = "";
  }, 3000);
}
</script>

<template>
  <NewFeatureNotification class="fr-mb-5v" @close="closeNotification" />

  <p :id="`rich-text-editor-label-${uniqueId}`" class="fr-label" :class="showLabel ? 'fr-mb-1v' : 'fr-sr-only'">
    {{ label }}
  </p>
  <p class="fr-sr-only" aria-live="polite">{{ uploadSuccess }}</p>
  <p :id="`rich-text-editor-description-${uniqueId}`" class="fr-text--xs fr-mb-1w editor-description">{{ description }}</p>
  <TiptapEditor
    v-bind="$attrs"
    :key="uniqueId"
    ref="richTextEditorRef"
    class="fr-mb-4w"
    :model-value="modelValue"
    :labelled-by="`rich-text-editor-label-${uniqueId}`"
    :described-by="`rich-text-editor-description-${uniqueId}`"
    :disabled="isOffline"
    @update:model-value="$emit('update:comment', $event)"
    @image:uploaded="announceUploadSuccess"
  />
</template>

<style scoped>
.editor-description {
  color: var(--text-mention-grey);
}
</style>
