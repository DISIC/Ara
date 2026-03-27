<script setup lang="ts">
import { useTemplateRef, watch } from "vue";

import { FileErrorMessage } from "../../enums";
import { ExampleImageFile, NotCompliantItem } from "../../types";
import { getUploadUrl } from "../../utils";
import FileList, { FileListFile } from "../ui/FileList.vue";
import CriteriumNotCompliantItem from "./CriteriumNotCompliantItem.vue";
import LazyAccordion from "./LazyAccordion.vue";

const props = defineProps<{
  id: string;
  criteriumId: number;
  errorMessage?: FileErrorMessage | null;
  exampleImages: ExampleImageFile[];
  items: NotCompliantItem[];
  onDelete: (flFile: FileListFile) => void;
}

const props = withDefaults(defineProps<Props>(), {
  errorMessage: null
});

const emit = defineEmits<{
  (e: "file-deleted", payload: { resolve: () => void; flFile: FileListFile }): Promise<void>;
  (e: "update:items", payload: NotCompliantItem[]): void;
}>();

defineExpose({ disclose });

const lazyAccordionRef = useTemplateRef<InstanceType<typeof LazyAccordion>>("lazyAccordionRef");

const criteriumNotCompliantItemRefs =
  useTemplateRef<InstanceType<typeof CriteriumNotCompliantItem>[]>("criteriumNotCompliantItemRef");

let hasJustBeenSetAsNotCompliant = false;

async function disclose() {
  const accordion = lazyAccordionRef.value?.accordionRef;

  hasJustBeenSetAsNotCompliant = true;
  dsfr(accordion).accordionsGroup.members[0].disclose();
}

watch(props.items, () => {
  emit("update:items", props.items);
});

function lazyAccordionOpened() {
  if (!props.items.length) {
    emit("update:items", [
      {
        title: null,
        comment: null,
        userImpact: null,
        quickWin: false,
        criterionResultId: props.criteriumId
      }
    ]);
  }

  if (!hasJustBeenSetAsNotCompliant) {
    return;
  }

  if (criteriumNotCompliantItemRefs.value
    && criteriumNotCompliantItemRefs.value.length) {
    const ref = criteriumNotCompliantItemRefs.value[0];
    if (ref) {
      ref.textFocusEditor();
    }
  }

  hasJustBeenSetAsNotCompliant = false;
}

function setFocusToCommentEditor() {
  if (criteriumNotCompliantItemRefs.value
    && criteriumNotCompliantItemRefs.value.length) {
    const ref = criteriumNotCompliantItemRefs.value[0];
    if (ref) {
      ref.commentFocusEditor();
    }
  }
}

function handleAddErrorClick() {
  emit("update:items", [
    ...props.items,
    {
      title: null,
      comment: null,
      userImpact: null,
      quickWin: false,
      criterionResultId: props.criteriumId
    }
  ]);
}

function onDeleteNotCompliantItemClick(index: number) {
  const items = props.items;
  items.splice(index, 1);
}

function onUpdateNotCompliantItemClick(index: number, item: NotCompliantItem) {
  const items = props.items;
  items[index] = item;
}
</script>

<template>
  <LazyAccordion
    ref="lazyAccordionRef"
    disclose-color="var(--background-default-grey)"
    @opened="lazyAccordionOpened"
  >
    <template #title>
      Erreurs et recommandations <span :class="{ 'fr-text--bold': items.length > 0 }"> ({{ items.length }})</span>
    </template>

    <div v-for="(item, index) in items" :key="index" class="not-compliant-item">

      <CriteriumNotCompliantItem
        ref="criteriumNotCompliantItemRef"
        :index="index"
        :item="item"
        :criterium-result-id="criteriumId"
        :can-delete="items.length > 1"
        :on-delete="onDeleteNotCompliantItemClick"
        :on-update="onUpdateNotCompliantItemClick"
      />

    </div>

    <div class="add">
      <button type="button" @click="handleAddErrorClick">Ajouter une erreur</button>
    </div>

    <!-- FILES -->
    <FileList
      class="fr-mb-4w"
      :files="exampleImages.map(f => ({
        filename: f.originalFilename,
        key: f.key,
        mimetype: f.mimetype,
        size: f.size,
        thumbnailUrl: f.thumbnailKey ? getUploadUrl(f.thumbnailKey) : undefined,
        url: getUploadUrl(f.key)
      :delete-only="true"
      :multiple="true"
      :focus-on-delete="setFocusToCommentEditor"
      @file-deleted="emit('file-deleted', $event)"
      
    />

  </LazyAccordion>
</template>
<style>
.not-compliant-item {
  border-bottom: 1px solid var(--border-default-grey);
  padding-bottom: 1em;
  margin: 1em 0;

  &:first-child {
    margin-top: 0;
  }
}
</style>
