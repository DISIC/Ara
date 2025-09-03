<script setup lang="ts">
import { ref } from "vue";

import { useIsOffline } from "../../composables/useIsOffline";
import { AuditFile, CriterionResultUserImpact } from "../../types";
import { formatUserImpact } from "../../utils";
import TiptapEditor from "../tiptap/TiptapEditor.vue";
import FileUpload from "../ui/FileUpload.vue";
import { RadioColor } from "../ui/Radio.vue";
import RadioGroup from "../ui/RadioGroup.vue";
import LazyAccordion from "./LazyAccordion.vue";

defineProps<{
  id: string;
  comment: string | null;
  exampleImages: AuditFile[];
  quickWin?: boolean;
  userImpact: CriterionResultUserImpact | null;
  onUpload: (file: File) => void;
  onDelete: (file: AuditFile) => void;
}>();

defineEmits<{
  (e: "update:comment", payload: string): void;
  (e: "update:userImpact", payload: CriterionResultUserImpact | null): void;
  (e: "update:quickWin", payload: boolean): void;
}>();

defineExpose({ disclose });

const userImpacts: Array<{
  label: string;
  value: CriterionResultUserImpact;
  color?: RadioColor;
}> = [
  {
    value: CriterionResultUserImpact.BLOCKING,
    label: formatUserImpact(CriterionResultUserImpact.BLOCKING),
    color: RadioColor.RED
  },
  {
    value: CriterionResultUserImpact.MAJOR,
    label: formatUserImpact(CriterionResultUserImpact.MAJOR),
    color: RadioColor.YELLOW
  },
  {
    value: CriterionResultUserImpact.MINOR,
    label: formatUserImpact(CriterionResultUserImpact.MINOR),
    color: RadioColor.GREY
  }
];

const isOffline = useIsOffline();

const lazyAccordionRef = ref<InstanceType<typeof LazyAccordion>>();
const commentEditorRef = ref<InstanceType<typeof TiptapEditor>>();

let hasJustBeenSetAsNotCompliant = false;

async function disclose() {
  const accordion = lazyAccordionRef.value?.accordionRef;

  hasJustBeenSetAsNotCompliant = true;
  dsfr(accordion).accordionsGroup.members[0].disclose();
}

function lazyAccordionOpened() {
  if (!hasJustBeenSetAsNotCompliant) {
    return;
  }

  commentEditorRef.value?.focusEditor();
  hasJustBeenSetAsNotCompliant = false;
}

const title = "Erreur et recommandation";
</script>

<template>
  <LazyAccordion
    ref="lazyAccordionRef"
    :title="title"
    disclose-color="var(--background-default-grey)"
    @opened="lazyAccordionOpened"
  >
    <!-- COMMENT -->
    <p :id="`criterum-comment-field-${id}`" class="fr-label fr-sr-only">
      {{ title }}
    </p>
    <TiptapEditor
      :key="id"
      ref="commentEditorRef"
      class="fr-mb-4w"
      :model-value="comment"
      :labelled-by="`criterum-comment-field-${id}`"
      :disabled="isOffline"
      @update:model-value="$emit('update:comment', $event)"
    />

    <!-- FILE -->
    <FileUpload
      class="fr-mb-4w"
      :accepted-formats="['jpg', 'jpeg', 'png']"
      :audit-files="exampleImages"
      :multiple="true"
      title="Ajouter des images d’exemple"
      :on-upload="onUpload"
      :on-delete="onDelete"
    />

    <!-- USER IMPACT -->
    <RadioGroup
      class="fr-mb-4w"
      :model-value="userImpact"
      :items="userImpacts"
      :default-value="null"
      :disabled="isOffline"
      @update:model-value="$emit('update:userImpact', $event)"
    >
      <template #label>
        <div class="user-impact-label">
          Impact sur l’usager
          <button
            aria-describedby="tooltip"
            type="button"
            class="fr-btn fr-btn--tooltip fr-btn--sm fr-icon-question-line fr-btn--tertiary-no-outline"
            data-fr-js-tooltip-referent="true"
          >
            Informations sur l’impact usager
          </button>

          <div
            id="tooltip"
            class="fr-tooltip fr-placement"
            role="tooltip"
            data-fr-js-tooltip="true"
          >
            <p class="fr-text--xs fr-mb-1w">
              <strong>Bloquant</strong> : empêche complètement l’accès ou
              l’utilisation.<br />
              <span class="user-impact-example">Ex : il est impossible de soumettre un formulaire au
                clavier.</span>
            </p>
            <p class="fr-text--xs fr-mb-1w">
              <strong>Majeur</strong> : rend l’accès ou l’utilisation
              difficile.<br />
              <span class="user-impact-example">Ex : les champs ne sont pas regroupés.</span>
            </p>
            <p class="fr-text--xs fr-mb-0">
              <strong>Mineur</strong> : gêne légèrement sans empêcher l’accès ou
              l’utilisation.<br />
              <span class="user-impact-example">Ex : des retours à la ligne sont utilisés pour espacer des
                textes.</span>
            </p>
          </div>
        </div>
      </template>
    </RadioGroup>

    <!-- QUICK WIN -->
    <div class="fr-fieldset__element fr-fieldset__element--inline">
      <div class="fr-checkbox-group">
        <input
          :id="`criterium-quick-win-${id}`"
          :checked="quickWin"
          type="checkbox"
          @input="
            $emit(
              'update:quickWin',
              ($event.target as HTMLInputElement).checked
            )
          "
        />
        <label class="fr-label" :for="`criterium-quick-win-${id}`">
          Facile à corriger
        </label>
      </div>
    </div>
  </LazyAccordion>
</template>

<style scoped>
.user-impact-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-impact-example {
  font-style: italic;
}
</style>
