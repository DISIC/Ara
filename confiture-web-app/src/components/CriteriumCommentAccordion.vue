<script setup lang="ts">
import { computed, ref } from "vue";
import Radio, { RadioStatus } from "./Radio.vue";

enum CriterionResultUserImpact {
  MINOR = "MINOR",
  MAJOR = "MAJOR",
  BLOCKING = "BLOCKING",
}

const props = defineProps<{
  status: string;
  id: string;
}>();

const radios = [
  {
    label: "Mineur",
    id: `criterium-user-impact-${props.id}-${CriterionResultUserImpact.MINOR}`,
    status: RadioStatus.NEUTRAL,
  },
  {
    label: "Majeur",
    id: `criterium-user-impact-${props.id}-${CriterionResultUserImpact.MAJOR}`,
    status: RadioStatus.WARNING,
  },
  {
    label: "Bloquant",
    id: `criterium-user-impact-${props.id}-${CriterionResultUserImpact.BLOCKING}`,
    status: RadioStatus.DANGER,
  },
];

const comment = ref<string>("");
const userImpact = ref<string>("");

const isNotCompliant = computed(() => props.status === "not-compliant");
const label = computed(() => {
  return isNotCompliant.value
    ? "Description de l’erreur"
    : "Commentaire (optionnel)";
});
</script>

<template>
  <div class="fr-accordion">
    <span class="fr-accordion__title">
      <button
        class="fr-accordion__btn"
        aria-expanded="false"
        :aria-controls="`criterium-comment-${id}`"
      >
        {{ label }}
      </button>
    </span>
    <div :id="`criterium-comment-${id}`" class="fr-collapse">
      <!-- COMMENT -->
      <div class="fr-input-group fr-mb-4w">
        <label class="fr-label sr-only" :for="`criterum-comment-field-${id}`">
          {{ label }}
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

      <!-- USER IMPACT -->
      <template v-if="isNotCompliant">
        <p class="fr-mt-4w fr-mb-3v fr-text--bold">Impact sur l’usager</p>
        <div class="radios">
          <Radio
            v-for="radio in radios"
            :id="radio.id"
            :key="radio.id"
            v-model="userImpact"
            :name="`userImpact-${id}`"
            :label="radio.label"
            :status="radio.status"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.radios {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
</style>
