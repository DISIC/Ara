<script setup lang="ts">
import { ref } from "vue";

defineProps<{ id: string }>();

const comment = ref<string>("");
</script>

<template>
  <div class="fr-accordion">
    <span class="fr-accordion__title">
      <button
        class="fr-accordion__btn"
        aria-expanded="false"
        :aria-controls="`criterium-comment-${id}`"
      >
        Recommendation de correction (optionnel)
      </button>
    </span>
    <div :id="`criterium-comment-${id}`" class="fr-collapse">
      <!-- COMMENT -->
      <div class="fr-input-group fr-mb-4w">
        <label class="fr-label sr-only" :for="`criterum-comment-field-${id}`">
          Recommendation de correction (optionnel)
        </label>
        <textarea
          :id="`criterum-comment-field-${id}`"
          v-model="comment"
          class="fr-mt-0 fr-input"
          rows="5"
        ></textarea>
      </div>

      <!-- FILE -->
      <div class="fr-upload-group">
        <label class="fr-text--bold fr-label" for="file-upload">
          Ajouter un exemple
          <span class="fr-mt-1v fr-text--regular fr-hint-text">
            Taille maximale par fichier : 1 Mo, formats : jpg, png, pdf
          </span>
        </label>
        <!-- TODO: handle file upload -->
        <input id="file-upload" class="fr-upload" type="file" />
      </div>
    </div>
  </div>
</template>
