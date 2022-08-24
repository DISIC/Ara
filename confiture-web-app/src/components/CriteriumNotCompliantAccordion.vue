<script setup lang="ts">
import { CriterionResultUserImpact } from "../types";
import { formatUserImpact } from "../utils";
import LazyAccordion from "./LazyAccordion.vue";
import Radio, { RadioColor } from "./Radio.vue";

defineProps<{
  id: string;
  comment: string | null;
  userImpact: CriterionResultUserImpact | null;
}>();

defineEmits<{
  (e: "update:comment", payload: string): void;
  (e: "update:userImpact", payload: CriterionResultUserImpact | null): void;
}>();

const userImpacts: Array<{
  color?: RadioColor;
  userImpact: CriterionResultUserImpact;
}> = [
  { userImpact: CriterionResultUserImpact.MINOR, color: "grey" },
  { userImpact: CriterionResultUserImpact.MAJOR, color: "yellow" },
  { userImpact: CriterionResultUserImpact.BLOCKING, color: "red" },
];
</script>

<template>
  <LazyAccordion title="Description de l’erreur (optionnel)">
    <!-- COMMENT -->
    <div class="fr-input-group fr-mb-4w">
      <label class="fr-label sr-only" :for="`criterum-comment-field-${id}`">
        Description de l’erreur (optionnel)
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
    <div class="fr-upload-group fr-mb-4w">
      <label class="fr-text--bold fr-label" :for="`file-upload-${id}`">
        Ajouter un exemple
        <span class="fr-mt-1v fr-text--regular fr-hint-text">
          Taille maximale par fichier : 1 Mo, formats : jpg, png, pdf
        </span>
      </label>
      <!-- TODO: handle file upload -->
      <input :id="`file-upload-${id}`" class="fr-upload" type="file" />
    </div>

    <!-- USER IMPACT -->
    <fieldset class="fr-mx-0 fr-p-0 user-impact-container">
      <legend class="fr-text--bold fr-label fr-mb-3v">
        Impact sur l’usager
      </legend>
      <Radio
        v-for="u in userImpacts"
        :id="`user-impact-${id}-${u.userImpact}`"
        :key="u.userImpact"
        :label="u.userImpact ? formatUserImpact(u.userImpact) : 'Non-renseigné'"
        :name="`user-impact-${id}`"
        :value="u.userImpact"
        :color="u.color"
        :model-value="userImpact"
        @update:model-value="$emit('update:userImpact', $event)"
      />
    </fieldset>
  </LazyAccordion>
</template>

<style scoped>
.user-impact-container {
  border: none;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
</style>
