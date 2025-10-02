<script lang="ts" setup>
import { nextTick, ref, useId, watch } from "vue";

import DsfrField from "./DsfrField.vue";

const props = defineProps<{
  modelValue: string[];
  label: string;
  hint?: string;
  addLabel: string;
  error?: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [tags: string[]];
}>();

defineSlots<{
  addLabel(): any;
}>();

let nextUid = 1;
function getUid() {
  return nextUid++;
}

const inputValue = ref("");
// [uid, tag]
const tags = ref<[number, string][]>([]);

watch(
  () => props.modelValue,
  (modelValue) => {
    tags.value = modelValue.map((tag) => [getUid(), tag]);
  },
  {
    immediate: true
  }
);

const inputRef = ref<InstanceType<typeof DsfrField>>();
const tagButtonsRefs = ref<HTMLButtonElement[]>([]);
const submitButtonRef = ref<HTMLButtonElement>();

function addTags() {
  const newTags = inputValue.value.split(",").filter(Boolean);

  emit("update:modelValue", [...props.modelValue, ...newTags]);

  inputValue.value = "";
}

async function removeTag(at: number) {
  emit(
    "update:modelValue",
    props.modelValue.filter((_, i) => {
      return i !== at;
    })
  );
  await nextTick();

  const nextTagButton = tagButtonsRefs.value.at(at);
  if (nextTagButton) {
    nextTagButton.focus();
  } else {
    submitButtonRef.value?.focus();
  }
}

defineExpose({
  flush() {
    addTags();
  },
  focus() {
    inputRef.value?.focus();
  }
});

const listId = useId();
</script>

<template>
  <DsfrField
    :id="`transverse-elements-list-${listId}`"
    ref="inputRef"
    v-model="inputValue"
    class="fr-mb-3v field"
    :label="label"
    :hint="hint"
    type="text"
    v-bind="$attrs"
    :error="error"
    @keydown.enter.prevent="addTags"
  >
    <template #trailing>
      <button
        type="button"
        class="fr-btn fr-btn--secondary fr-btn--icon-left fr-icon-add-line fr-mt-1w"
        @click="addTags"
      >
        Ajouter <span class="fr-sr-only">{{ addLabel }}</span>
      </button>
    </template>
  </DsfrField>
  <ul v-if="tags.length" class="fr-tags-group fr-mb-5v">
    <li v-for="([uid, tag], i) in tags" :key="uid">
      <button
        ref="tagButtonsRefs"
        class="fr-tag fr-icon-close-line fr-tag--icon-left light-blue-button-tags"
        type="button"
        @click="removeTag(i)"
      >
        <span class="fr-sr-only">Retirer</span>
        {{ tag }}
      </button>
    </li>
  </ul>
</template>

<style scoped>
.field {
  display: grid;
  grid-template-columns: auto auto;
  gap: 0 1rem;

  &:deep(label) {
    grid-column: span 2;
  }

  &:deep(input) {
    max-width: 30rem;
  }
}
</style>
