<script setup lang="ts">
import { last, orderBy } from "lodash-es";

import { computed, provide, useTemplateRef } from "vue";
import { ExampleImageFile, NotCompliantItem } from "../../types";
import { getUploadUrl } from "../../utils";
import FileList, { FileListFile } from "../ui/FileList.vue";
import CriteriumNotCompliantItem from "./CriteriumNotCompliantItem.vue";
import { getFocusWhenListEmptyKey } from "./get-focus-when-list-empty-key";
import LazyAccordion from "./LazyAccordion.vue";

const props = defineProps<{
  id: string;
  exampleImages: ExampleImageFile[];
  notCompliantItems: NotCompliantItem[];
}>();

provide(getFocusWhenListEmptyKey, getFocusWhenListEmpty);

function getFocusWhenListEmpty(): HTMLElement | null {
  return criteriumNotCompliantItemRefs.value?.length ?
    criteriumNotCompliantItemRefs.value[0].$el :
    null;
}

const orderedItems = computed(() => {
  return orderBy(props.notCompliantItems, x => x.id);
});

const notCompliantItemsCount = computed(() => {
  return props.notCompliantItems
    .filter(x => x.comment || x.quickWin || x.title || x.userImpact)
    .length;
});

const emit = defineEmits<{
  (e: "file-deleted", payload: { resolve: () => void; flFile: FileListFile }): Promise<void>;
  (e: "create:item"): void;
  (e: "update:item", payload: { item: NotCompliantItem; debounce: boolean }): void;
  (e: "delete:item", payload: { id: number }): void;
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
  if (!props.notCompliantItems.length) {
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
  emit("create:item");
}

function onDeleteNotCompliantItemClick(id: number) {
  emit("delete:item", { id });
}

function onUpdateNotCompliantItemClick(
  item: NotCompliantItem,
  debounce: boolean
) {
  emit("update:item", { item, debounce });
}
</script>

<template>
  <LazyAccordion
    ref="lazyAccordionRef"
    disclose-color="var(--background-default-grey)"
    @opened="lazyAccordionOpened"
  >
    <template #title>
      Erreurs et recommandations <span :class="{ 'fr-text--bold': notCompliantItemsCount > 0 }"> ({{ notCompliantItemsCount }})</span>
    </template>

    <div v-for="(item, index) in orderedItems" :key="id + '-not-compliant-item-' + item.id" class="not-compliant-item">

      <CriteriumNotCompliantItem
        ref="criteriumNotCompliantItemRef"
        :index="index"
        :item="item"
        :can-delete="notCompliantItems.length > 1"
        @delete="onDeleteNotCompliantItemClick"
        @update="onUpdateNotCompliantItemClick"
      />

    </div>

    <div v-if="notCompliantItems.length" class="fr-mx-n3v">
      <button
        type="button"
        class="not-compliant-item-add fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-add-line"
        @click="addEmptyErrorToNotCompliantItems"
      >
        Ajouter une erreur</button>
    </div>

    <!-- FILES -->
    <FileList
      v-if="exampleImages.length"
      class="fr-mb-4w"
      :files="exampleImages.map(f => ({
        filename: f.originalFilename,
        key: f.key,
        mimetype: f.mimetype,
        size: f.size,
        thumbnailUrl: f.thumbnailKey ? getUploadUrl(f.thumbnailKey) : undefined,
        url: getUploadUrl(f.key)
      }))"
      :delete-only="true"
      :multiple="true"
      :focus-on-delete="setFocusToCommentEditor"
      @file-deleted="emit('file-deleted', $event)"
    />

  </LazyAccordion>
</template>

<style scoped>
.not-compliant-item {
  padding: 1em 0.75rem;
  padding-block-end: 1.25em;
  border-block-end: 1px solid var(--border-default-grey);
  margin: 0 -0.75rem;

  &:first-child {
    padding-top: 0.5em;
  }
}

.not-compliant-item-add {
  padding: 1em 0;
  width: 100%;
  justify-content: center;

  &:hover {
    background-color: var(--blue-france-950-100) !important;
  }

  &:active {
    background-color: var(--blue-france-925-125) !important;
  }

  &:focus {
    outline-offset: -2px;
  }
}

:deep(.fr-collapse--expanded) {
  padding-block: 0 0 !important;
}
</style>
