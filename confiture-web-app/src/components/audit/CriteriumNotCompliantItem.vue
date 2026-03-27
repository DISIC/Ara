<script setup lang="ts">
import { useTemplateRef } from "vue";
import { useIsOffline } from "../../composables/useIsOffline";
import { CriterionResultUserImpact, NotCompliantItem } from "../../types";
import { formatUserImpact } from "../../utils";
import RichTextEditor from "../tiptap/RichTextEditor.vue";
import DsfrField from "../ui/DsfrField.vue";
import { RadioColor } from "../ui/Radio.vue";
import RadioGroup from "../ui/RadioGroup.vue";

const props = defineProps<{
  index: number;
  item: NotCompliantItem;
  criteriumResultId: number;
  canDelete: boolean;
  onDelete: (index: number) => void;
  onUpdate: (index: number, item: NotCompliantItem) => void;
}>();

const baseTitle = "Erreur";

function handleItemValueClick(field: keyof NotCompliantItem, value: any) {
  const item = { ...props.item };
  item[field] = value as never;

  props.onUpdate(props.index, item);
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
    <div class="fr-col-4 delete">
      <button type="button" :disabled="!canDelete" @click="onDelete(index)">Supprimer<span class="fr-sr-only"> l'erreur {{ index }}</span></button>
    </div>
  </div>

  <DsfrField
    :id="`error-title-${index}-${criteriumResultId}`"
    ref="titleEditorRef"
    :model-value="item.title"
    type="text"
    label="Titre de l'erreur"
    class="fr-mb-4w user-error-label"
    @change="handleItemValueClick('title', $event.target.value)"
  />

  <RichTextEditor
    :id="`error-comment-${index}-${criteriumResultId}`"
    ref="commentEditorRef"
    type="criterium"
    :model-value="item.comment"
    :label="`Recommandations sur l'erreur ${index}`"
    class="fr-mb-4w"
    description="Décrivez les erreurs, proposez une correction et ajoutez une image pour illustrer l’erreur ou la correction."
    @update:model-value="handleItemValueClick('comment', $event)"
  />

  <!-- USER IMPACT -->
  <RadioGroup
    :id="`error-user-impact-${index}-${criteriumResultId}`"
    class="fr-mb-4w"
    :model-value="item.userImpact"
    :items="userImpacts"
    :default-value="null"
    :disabled="isOffline"
    @update:model-value="handleItemValueClick('userImpact', $event)"
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
        :id="`criterium-quick-win-${index}-${criteriumResultId}`"
        :checked="item.quickWin"
        type="checkbox"
        @input="handleItemValueClick('quickWin', ($event.target as HTMLInputElement).checked)"
      />
      <label class="fr-label" :for="`criterium-quick-win-${index}-${criteriumResultId}`">
        Facile à corriger
      </label>
    </div>
  </div>
</template>

<style>
.user-error-label label {
  font-size: 0.75rem;
  color: var(--text-mention-grey);
}

.delete {
  text-align: right;

  button {
    color: var(--text-mention-grey);
  }
}
</style>
