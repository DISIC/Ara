<script setup lang="ts">
import { last } from "lodash-es";

import { computed, provide, ref, useTemplateRef, watch } from "vue";
import { ExampleImageFile, NotCompliantItem } from "../../types";
import { getUploadUrl } from "../../utils";
import FileList, { FileListFile } from "../ui/FileList.vue";
import CriteriumNotCompliantItem from "./CriteriumNotCompliantItem.vue";
import { getFocusWhenListEmptyKey } from "./get-focus-when-list-empty-key";
import LazyAccordion from "./LazyAccordion.vue";

const props = defineProps<{
  id: string;
  exampleImages: ExampleImageFile[];
  items: NotCompliantItem[];
}>();

provide(getFocusWhenListEmptyKey, getFocusWhenListEmpty);

function getFocusWhenListEmpty(): HTMLElement | null {
  return criteriumNotCompliantItemRefs.value?.length ?
    criteriumNotCompliantItemRefs.value[0].$el :
    null;
}

const notCompliantItems = ref<NotCompliantItem[]>([]);

watch(() => props.items, () => {
  notCompliantItems.value = [...props.items];
}, {
  immediate: true
});

const countNotCompliantItemsRecommandations = computed(() => {
  return notCompliantItems.value
    .filter(x => x.comment || x.quickWin === true || x.title || x.userImpact)
    .length;
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
  if (!notCompliantItems.value.length) {
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
  notCompliantItems.value.push({
    title: null,
    comment: null,
    userImpact: null,
    quickWin: false
  });
}

function onDeleteNotCompliantItemClick(index: number) {
  emit("update:item", { index, item: props.items[index], action: "delete" });
}

function onUpdateNotCompliantItemClick(index: number, item: NotCompliantItem) {
  emit("update:item", { index, item, action: !item.id ? "add" : "update" });
}
</script>

<template>
  <LazyAccordion
    ref="lazyAccordionRef"
    disclose-color="var(--background-default-grey)"
    @opened="lazyAccordionOpened"
  >
    <template #title>
      Erreurs et recommandations <span :class="{ 'fr-text--bold': countNotCompliantItemsRecommandations > 0 }"> ({{ countNotCompliantItemsRecommandations }})</span>
    </template>

    <div v-for="(item, index) in notCompliantItems" :key="index" class="not-compliant-item">

      <CriteriumNotCompliantItem
        ref="criteriumNotCompliantItemRef"
        :index="index"
        :item="item"
        :can-delete="notCompliantItems.length > 1"
        :on-delete="onDeleteNotCompliantItemClick"
        :on-update="onUpdateNotCompliantItemClick"
      />

    </div>

    <div v-if="notCompliantItems.length" class="not-compliant-item-add">
      <button
        type="button"
        class="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-add-line"
        @click="addEmptyErrorToNotCompliantItems"
      >
        Ajouter une erreur</button>
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
      }))"
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

.not-compliant-item-add {
  text-align: center;
}
</style>
