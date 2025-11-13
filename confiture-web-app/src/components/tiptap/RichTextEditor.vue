<script lang="ts" setup>
import { ref, useId } from "vue";

import { useIsOffline } from "../../composables/useIsOffline";
import NewFeatureNotification, { imageUploadEditorLocalStorageKey } from "../audit/NewFeatureNotification.vue";
import TiptapEditor from "./TiptapEditor.vue";

defineOptions({
  inheritAttrs: false
});

defineProps<{
  modelValue: string | null;
  label: string;
  description: string;
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
// Handle alert to announce images in editor
// TODO: remove this in february 2026
const showNewFeatureNotification =
  ref(!localStorage.getItem(imageUploadEditorLocalStorageKey));

function closeNotification() {
  showNewFeatureNotification.value = false;
  richTextEditorRef.value?.focusEditor();
}
</script>

<template>
  <NewFeatureNotification v-if="showNewFeatureNotification" class="fr-mb-5v" @close="closeNotification" />

  <p :id="`rich-text-editor-label-${uniqueId}`" class="fr-label fr-sr-only">
    {{ label }}
  </p>
  <p data-image-success-message class="fr-sr-only" aria-live="polite"></p>
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
  />
</template>

<style scoped>
.editor-description {
  color: var(--text-mention-grey);
}
</style>
