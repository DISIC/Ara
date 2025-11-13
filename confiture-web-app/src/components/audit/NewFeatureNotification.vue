<script lang="ts">
export const imageUploadEditorLocalStorageKey = "ara:hide-image-upload-editor-alert";
</script>

<script setup lang="ts">
const emit = defineEmits<{
  close: [];
}>();

function closeNotification() {
  localStorage.setItem(
    imageUploadEditorLocalStorageKey,
    "true"
  );
  emit("close");
}
</script>

<template>
  <div class="fr-alert fr-alert--info fr-alert--sm fr-pb-2w notification">
    <h3 class="fr-alert__title">Nouveauté : ajoutez vos images dans les zones de texte</h3>
    <p>L’ajout d’image se fait désormais directement dans la zone de texte, par copier-coller, glisser-déposer ou à l’aide du bouton « Insérer une image ».</p>
    <button class="fr-btn fr-btn--tertiary-no-outline fr-btn--sm notification-action" @click="closeNotification">Ne plus afficher</button>
  </div>
</template>

<style scoped>
.notification {
  display: flex;
  flex-direction: column;
}

.notification-action {
  align-self: end;
}
</style>
