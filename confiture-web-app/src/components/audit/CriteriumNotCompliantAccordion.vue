<script setup lang="ts">
import { useTemplateRef, watch } from "vue";

import { FileErrorMessage } from "../../enums";
import { ExampleImageFile, NotCompliantItem } from "../../types";
import { getUploadUrl } from "../../utils";
import FileList, { FileListFile } from "../ui/FileList.vue";
import CriteriumNotCompliantItem from "./CriteriumNotCompliantItem.vue";
import LazyAccordion from "./LazyAccordion.vue";

export interface Props {
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
  (e: "delete-file", payload: ExampleImageFile): void;
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
      title: "null",
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
  emit("update:items", items);
}

function onUpdateNotCompliantItemClick(index: number, item: NotCompliantItem) {
  const items = props.items;
  items[index] = item;
  emit("update:items", items);
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
      :on-delete="onDelete"
      :focus-on-delete="setFocusToCommentEditor"
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
