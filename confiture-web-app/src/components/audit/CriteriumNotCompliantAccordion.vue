<script setup lang="ts">
import { debounce, last, orderBy } from "lodash-es";

import { computed, provide, ref, useTemplateRef } from "vue";
import { useNotifications } from "../../composables/useNotifications";
import { DEFAULT_NOTIFICATION_ERROR_DESCRIPTION, DEFAULT_NOTIFICATION_ERROR_TITLE } from "../../enums";
import { useResultsStore } from "../../store";
import {
  AuditPage,
  CreateNotCompliantItemData,
  ExampleImageFile,
  NotCompliantItem,
  PatchNotCompliantItemData,
  UpdateNotCompliantItemData
} from "../../types";
import { captureWithPayloads, getUploadUrl, slugify } from "../../utils";
import FileList, { FileListFile } from "../ui/FileList.vue";
import CriteriumNotCompliantItem from "./CriteriumNotCompliantItem.vue";
import { getFocusWhenListEmptyKey } from "./get-focus-when-list-empty-key";
import LazyAccordion from "./LazyAccordion.vue";

const props = defineProps<{
  id: string;
  auditUniqueId: string;
  page: AuditPage;
  topicNumber: number;
  criterium: any;
  exampleImages: ExampleImageFile[];
  notCompliantItems: NotCompliantItem[];
}>();

provide(getFocusWhenListEmptyKey, getFocusWhenListEmpty);

const store = useResultsStore();

const notify = useNotifications();

function getFocusWhenListEmpty(): HTMLElement | null {
  return criteriumNotCompliantItemRefs.value?.length ?
    criteriumNotCompliantItemRefs.value[0].$el :
    null;
}

const notCompliantItems = ref<NotCompliantItem[]>(props.notCompliantItems);

const orderedItems = computed(() => {
  return orderBy(notCompliantItems.value, x => x.id);
});

const notCompliantItemsCount = computed(() => {
  return notCompliantItems.value
    .filter(x => x.comment || x.quickWin || x.title || x.userImpact)
    .length;
});

const emit = defineEmits<{
  (e: "file-deleted", payload: { resolve: () => void; flFile: FileListFile }): Promise<void>;
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

function lazyAccordionOpened() {
  if (!props.notCompliantItems.length) {
    createNotCompliantItem();
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

const createNotCompliantItem = async (
  itemToCreate: NotCompliantItem | null = null) => {
  const { auditUniqueId, page, topicNumber, criterium } = props;
  const slug = slugify(page.name);
  const criteriumNumber = criterium.number;

  try {
    const itemAdded = await store.createNotCompliantItem(
      auditUniqueId,
      slug,
      topicNumber,
      criteriumNumber,
      itemToCreate ? itemToCreate as CreateNotCompliantItemData : null
    );

    notCompliantItems.value = [
      ...notCompliantItems.value,
      itemAdded
    ];

    // the time required for the value `result.value.notCompliantItems` to propagate
    setTimeout(() => setFocusToTextEditor(), 100);
  }
  catch (error) {
    notify(
      "error",
      DEFAULT_NOTIFICATION_ERROR_TITLE,
      DEFAULT_NOTIFICATION_ERROR_DESCRIPTION
    );
    captureWithPayloads(error);
  }
};

const deleteNotCompliantItem = async (id: number) => {
  const { auditUniqueId, page, topicNumber, criterium } = props;
  const slug = slugify(page.name);
  const criteriumNumber = criterium.number;

  const itemToDelete = notCompliantItems.value.find(x => x.id === id);

  try {
    await store.deleteNotCompliantItem(
      auditUniqueId,
      slug,
      topicNumber,
      criteriumNumber,
      id
    );

    notCompliantItems.value =
      notCompliantItems.value.filter(x => x.id !== id);

    notify(
      "success",
      undefined,
      `Erreur supprimée`,
      {
        action: {
          label: "Annuler",
          cb: async () => {
            await createNotCompliantItem(itemToDelete);
          }
        }
      }
    );
  } catch (error) {
    notify(
      "error",
      DEFAULT_NOTIFICATION_ERROR_TITLE,
      DEFAULT_NOTIFICATION_ERROR_DESCRIPTION
    );
    captureWithPayloads(error);
  }
};

const updateResultNotCompliantItem = async (payload:
{ patch: PatchNotCompliantItemData }) => {
  const { patch } = payload;
  const { id, ...changes } = patch;

  try {
    const { auditUniqueId, page, topicNumber, criterium } = props;
    const slug = slugify(page.name);
    const criteriumNumber = criterium.number;

    const notCompliantItemUpdated = await store.updateNotCompliantItem(
      auditUniqueId,
      slug,
      topicNumber,
      criteriumNumber,
      id,
      changes as UpdateNotCompliantItemData
    );

    notCompliantItems.value =
      notCompliantItems.value.map(x =>
        x.id === notCompliantItemUpdated.id ? notCompliantItemUpdated : x);
  } catch (error) {
    notify(
      "error",
      DEFAULT_NOTIFICATION_ERROR_TITLE,
      DEFAULT_NOTIFICATION_ERROR_DESCRIPTION
    );
    captureWithPayloads(error);
  }
};

// One debounce instance per (item id, field) so edits to different fields
// (or different items) don't cancel each other's pending update.
const debouncedUpdaters = new Map<
  string,
  ReturnType<typeof debounce<typeof updateResultNotCompliantItem>>
>();

const updateResultNotCompliantItemDebounce = (payload: {
  patch: PatchNotCompliantItemData;
}) => {
  const { id, ...changes } = payload.patch;
  const key = `${id}-${Object.keys(changes).join(",")}`;

  let debounced = debouncedUpdaters.get(key);
  if (!debounced) {
    debounced = debounce(updateResultNotCompliantItem, 500);
    debouncedUpdaters.set(key, debounced);
  }
  debounced(payload);
};

function onUpdateNotCompliantItemClick(
  patch: PatchNotCompliantItemData,
  debounce: boolean
) {
  if (debounce) {
    updateResultNotCompliantItemDebounce({ patch });
  } else {
    updateResultNotCompliantItem({ patch }); }
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
        @delete="deleteNotCompliantItem"
        @update="onUpdateNotCompliantItemClick"
      />

    </div>

    <div v-if="notCompliantItems.length" class="fr-mx-n3v">
      <button
        type="button"
        class="not-compliant-item-add fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-add-line"
        @click="createNotCompliantItem()"
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
  padding: 1rem 0.75rem;
  padding-block-end: 1.25rem;
  border-block-end: 1px solid var(--border-default-grey);
  margin: 0 -0.75rem;

  &:first-child {
    padding-top: 0.5rem;
  }
}

.not-compliant-item-add {
  padding: 1rem 0;
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
