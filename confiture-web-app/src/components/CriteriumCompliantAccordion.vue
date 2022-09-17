<script setup lang="ts">
import LazyAccordion from "./LazyAccordion.vue";

defineProps<{
  id: string;
  comment: string | null;
}>();

defineEmits<{
  (e: "update:comment", payload: string): void;
}>();
</script>

<template>
  <LazyAccordion
    disclose-color="var(--background-default-grey)"
    title="Commentaire (optionnel)"
  >
    <!-- COMMENT -->
    <div class="fr-input-group fr-mb-4w">
      <label class="fr-label sr-only" :for="`criterum-comment-field-${id}`">
        Commentaire (optionnel)
      </label>
      <textarea
        :id="`criterum-comment-field-${id}`"
        :value="comment ?? ''"
        class="fr-mt-0 fr-input"
        rows="5"
        @input="
          $emit('update:comment', ($event.target as HTMLTextAreaElement).value)
        "
      ></textarea>
    </div>

    <!-- FILE -->
    <!-- <div class="fr-upload-group">
      <label class="fr-text--bold fr-label" :for="`file-upload-${id}`">
        Ajouter un exemple
        <span class="fr-mt-1v fr-text--regular fr-hint-text">
          Taille maximale par fichier : 1 Mo, formats : jpg, png, pdf
        </span>
      </label>
      <input :id="`file-upload-${id}`" class="fr-upload" type="file" />
    </div> -->
  </LazyAccordion>
</template>
