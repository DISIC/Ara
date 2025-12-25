<script lang="ts" setup>
import { computed, ref, useId } from "vue";

import { useIsOffline } from "../../composables/useIsOffline";
import { useAuditStore } from "../../store";
import AnnouncementAlert from "../ui/AnnouncementAlert.vue";
import TiptapEditor from "./TiptapEditor.vue";

defineOptions({
  inheritAttrs: false
});

const props = defineProps<{
  modelValue: string | null;
  label: string;
  description: string;
  type: "criterium" | "notes";
}>();

defineEmits(["update:comment"]);

defineExpose({
  focusEditor: () => {
    richTextEditorRef.value?.focusEditor();
  }
});

const auditStore = useAuditStore();
const isOffline = useIsOffline();
const uniqueId = useId();

const richTextEditorRef = ref<InstanceType<typeof TiptapEditor>>();

const showLabel = computed(() => props.type === "notes");

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
  <AnnouncementAlert
    class="fr-mb-5v"
    title="Nouveauté : ajoutez vos images dans les zones de texte"
    storage-key="rich-text-editor-images"
    @close="closeNotification"
  >
    <template #description>
      <template v-if="type === 'criterium'">
        <p>L’ajout d’image se fait désormais directement dans la zone de texte, par copier-coller, glisser-déposer ou à l’aide du bouton « Insérer une image ».</p>
        <p class="fr-mt-3w"><em>À noter : les images ajoutées lors de vos précédents audits via le composant « Ajouter une image d’exemple » sont conservées sous la zone de texte.</em></p>
      </template>
      <p v-else>Vous pouvez maintenant ajouter des images dans la zone de texte, par copier-coller, glisser-déposer ou à l’aide du bouton « Insérer une image ».</p>
    </template>
  </AnnouncementAlert>

  <p :id="`rich-text-editor-label-${uniqueId}`" class="fr-label" :class="showLabel ? 'fr-mb-1v' : 'fr-sr-only'">
    {{ label }}
  </p>
  <p class="fr-sr-only" aria-live="polite">{{ uploadSuccess }}</p>
  <p :id="`rich-text-editor-description-${uniqueId}`" class="fr-text--xs fr-mb-1w editor-description">
    {{ description }}
    <br />
    Taille maximale par image : 2 Mo. Une seule image peut être ajoutée à la fois.
  </p>
  <TiptapEditor
    v-bind="$attrs"
    :key="`${uniqueId}-${auditStore.currentPageId}`"
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
