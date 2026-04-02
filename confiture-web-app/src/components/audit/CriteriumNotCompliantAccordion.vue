<script setup lang="ts">
import { last } from "lodash-es";

import { useTemplateRef } from "vue";
import { FileErrorMessage } from "../../enums";
import { ExampleImageFile, NotCompliantItem } from "../../types";
import { getUploadUrl } from "../../utils";
import FileList, { FileListFile } from "../ui/FileList.vue";
import CriteriumNotCompliantItem from "./CriteriumNotCompliantItem.vue";
import LazyAccordion from "./LazyAccordion.vue";

const props = defineProps<{
  id: string;
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
  (e: "update:item", payload: { index: number; item: NotCompliantItem; action: string }): void;
}>();

defineExpose({ disclose, focus });

const lazyAccordionRef = useTemplateRef<InstanceType<typeof LazyAccordion>>("lazyAccordionRef");

const criteriumNotCompliantItemRefs =
  useTemplateRef<InstanceType<typeof CriteriumNotCompliantItem>[]>("criteriumNotCompliantItemRef");

let hasJustBeenSetAsNotCompliant = false;

async function disclose() {
  const accordion = lazyAccordionRef.value?.accordionRef;

  hasJustBeenSetAsNotCompliant = true;
  dsfr(accordion).accordionsGroup.members[0].disclose();
}

function focus(index?: number) {
  setFocusToTextEditor(index);
}

function lazyAccordionOpened() {
  if (!props.items.length) {
    addEmptyErrorToNotCompliantItems();
  }

  if (!hasJustBeenSetAsNotCompliant) {
    return;
  }

  setFocusToTextEditor();

  hasJustBeenSetAsNotCompliant = false;
}

function setFocusToTextEditor(index?: number) {
  if (criteriumNotCompliantItemRefs.value
    && criteriumNotCompliantItemRefs.value.length) {
    const ref = index !== undefined && index !== -1
      ? criteriumNotCompliantItemRefs.value[index] :
        last(criteriumNotCompliantItemRefs.value);
    if (ref) {
      ref.textFocusEditor();
    }
  }
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

function addEmptyErrorToNotCompliantItems() {
  emit("update:item", {
    index: -1,
    item: {
      title: null,
      comment: null,
      userImpact: null,
      quickWin: false
    },
    action: "add"
  });
}

function onDeleteNotCompliantItemClick(index: number) {
  emit("update:item", { index, item: props.items[index], action: "delete" });
}

function onUpdateNotCompliantItemClick(index: number, item: NotCompliantItem) {
  emit("update:item", { index, item, action: "update" });
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
        :can-delete="items.length > 1"
        :on-delete="onDeleteNotCompliantItemClick"
        :on-update="onUpdateNotCompliantItemClick"
      />

    </div>

    <div v-if="items.length" class="add">
      <button type="button" @click="addEmptyErrorToNotCompliantItems">Ajouter une erreur</button>
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
