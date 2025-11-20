<script setup lang="ts">
import { ref, computed } from "vue";

import { useIsOffline } from "../../composables/useIsOffline";
import { FileErrorMessage } from "../../enums";
import { CriterionResultUserImpact, ExampleImageFile } from "../../types";
import { formatUserImpact, getUploadUrl, isTiptapDocumentEmpty } from "../../utils";
import RichTextEditor from "../tiptap/RichTextEditor.vue";
import FileList from "../ui/FileList.vue";
import { RadioColor } from "../ui/Radio.vue";
import RadioGroup from "../ui/RadioGroup.vue";
import LazyAccordion from "./LazyAccordion.vue";

export interface Props {
  id: string;
  comment: string | null;
  errorMessage?: FileErrorMessage | null;
  exampleImages: ExampleImageFile[];
  quickWin?: boolean;
  userImpact: CriterionResultUserImpact | null;
}

const props = withDefaults(defineProps<Props>(), {
  errorMessage: null
});

const emit = defineEmits<{
  (e: "update:comment", payload: string): void;
  (e: "update:userImpact", payload: CriterionResultUserImpact | null): void;
  (e: "delete-file", payload: ExampleImageFile): void;
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

function handleDeleteFile(image: ExampleImageFile) {
  emit("delete-file", image);
}

const lazyAccordionRef = ref<InstanceType<typeof LazyAccordion>>();
const commentEditorRef = ref<InstanceType<typeof RichTextEditor>>();

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

const isFilledIn = computed(() => {
  return !isTiptapDocumentEmpty(props.comment)
    || props.exampleImages.length
    || props.quickWin
    || !!props.userImpact;
});

const title = computed(() => {
  return `Erreur et recommandation (${Number(isFilledIn.value)})`;
});
</script>

<template>
  <LazyAccordion
    ref="lazyAccordionRef"
    :title="title"
    disclose-color="var(--background-default-grey)"
    @opened="lazyAccordionOpened"
  >
    <RichTextEditor
      ref="commentEditorRef"
      type="criterium"
      :model-value="comment"
      :label="title"
      class="fr-mb-4w"
      description="Décrivez les erreurs, proposez une correction et ajoutez une image pour illustrer l’erreur ou la correction."
      @update:model-value="$emit('update:comment', $event)"
    />

    <!-- FILES -->
    <FileList
      v-if="exampleImages.length"
      ref="fileUpload"
      class="fr-mb-4w"
      :files="exampleImages.map(f => ({
        ...f,
        thumbnailUrl: f.thumbnailKey ? getUploadUrl(f.thumbnailKey) : undefined,
        filename: f.originalFilename,
        url: getUploadUrl(f.key)
      }))"
      title="Ajouter des images d’exemple"
      @delete="handleDeleteFile(
        exampleImages.find(f => f.key === $event)!
      )"
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
