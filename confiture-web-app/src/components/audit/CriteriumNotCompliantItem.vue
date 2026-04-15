<script setup lang="ts">
import { useTemplateRef } from "vue";
import { useDialog } from "../../composables/useDialog";
import { useIsOffline } from "../../composables/useIsOffline";
import { CriterionResultUserImpact, NotCompliantItem } from "../../types";
import { formatUserImpact } from "../../utils";
import RichTextEditor from "../tiptap/RichTextEditor.vue";
import DsfrField from "../ui/DsfrField.vue";
import { RadioColor } from "../ui/Radio.vue";
import RadioGroup from "../ui/RadioGroup.vue";

const props = defineProps<{
  index: number;
  topicNumber: number;
  criterium: any;
  item: NotCompliantItem;
  canDelete: boolean;
  onDelete: (index: number) => void;
  onUpdate: (index: number, item: NotCompliantItem, debounce: boolean) => void;
}>();

const baseTitle = "Erreur";

const dialog = useDialog();

function handleItemValueClick(field: keyof NotCompliantItem, value: any) {
  const item = { ...props.item };
  item[field] = value as never;

  props.onUpdate(props.index, item, field === "title" || field === "comment");
}

async function handleDeleteItemClick(index: number) {
  await dialog.showConfirm({
    title: `Vous allez supprimer l'erreur ${index + 1}`,
    message: `L'erreur ${index + 1} du critère ${props.topicNumber}.${props.criterium.number} sera définitivement supprimée`,
    cancelLabel: "Annuler",
    confirmLabel: `Supprimer l'erreur`,
    confirmAction: {
      cb: () => props.onDelete(index)
    },
    titleIcon: "fr-icon-warning-line"
  });
}

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

const commentEditorRef = useTemplateRef<InstanceType<typeof RichTextEditor>>("commentEditorRef");
const titleEditorRef = useTemplateRef<InstanceType<typeof DsfrField>>("titleEditorRef");

defineExpose({
  textFocusEditor: () => {
    titleEditorRef.value?.focus();
  },
  commentFocusEditor: () => {
    commentEditorRef.value?.focusEditor();
  }
});
</script>

<template>
  <div class="fr-grid-row">
    <div class="fr-col-8">
      <p>
        {{ baseTitle }} {{ index + 1 }}
      </p>
    </div>
    <div class="fr-col-4 error-user-delete">
      <button type="button" class="fr-btn fr-btn--tertiary-no-outline" :disabled="!canDelete" @click="handleDeleteItemClick(index)">Supprimer<span class="fr-sr-only"> l'erreur {{ index }}</span></button>
    </div>
  </div>

  <DsfrField
    :id="`error-title-${item.id}-${index}`"
    ref="titleEditorRef"
    :model-value="item.title"
    type="text"
    label="Titre de l'erreur"
    class="fr-mb-4w user-error-label"
    @input="handleItemValueClick('title', $event.target.value)"
  />

  <RichTextEditor
    :id="`error-comment-${item.id}-${index}`"
    ref="commentEditorRef"
    type="criterium"
    :model-value="item.comment"
    :label="`Recommandations sur l'erreur ${index + 1}`"
    class="fr-mb-1w"
    description="Description de l’erreur, proposition de correction et image pour illustrer l’erreur ou la correction"
    @update:model-value="handleItemValueClick('comment', $event)"
  />

  <!-- USER IMPACT -->
  <RadioGroup
    ref="userImpactRadioGroupRef"
    class="fr-mb-4w"
    tabindex="-1"
    :items="userImpacts"
    :default-value="null"
    :disabled="isOffline"
    :model-value="item.userImpact"
    @update:model-value="handleItemValueClick('userImpact', $event)"
  >
    <template #label>
      <div class="user-impact-label">
        <span>Impact sur l’usager</span>
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
        :id="`criterium-quick-win-${item.id}-${index}`"
        :checked="item.quickWin"
        type="checkbox"
        @input="handleItemValueClick('quickWin', ($event.target as HTMLInputElement).checked)"
      />
      <label class="fr-label" :for="`criterium-quick-win-${item.id}-${index}`">
        Facile à corriger
      </label>
    </div>
  </div>
</template>

<style>
.user-impact-label span,
.user-error-label label {
  font-size: 0.75rem;
  color: var(--text-mention-grey);
}

.user-impact-label span {
  vertical-align: text-bottom;
}

.error-user-delete {
  text-align: right;

  button {
    color: var(--text-action-high-blue-france);
  }
}
</style>
