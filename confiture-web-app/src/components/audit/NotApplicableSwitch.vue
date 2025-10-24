<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";

import { useIsOffline } from "../../composables/useIsOffline";
import { useAuditStore, useResultsStore } from "../../store";
import { CriteriumResultStatus } from "../../types";

const props = defineProps<{
  pageId: number;
  topicNumber: number;
  topicTitle: string;
}>();

defineExpose({ focusInput });

const isOffline = useIsOffline();

const resultsStore = useResultsStore();
const auditStore = useAuditStore();

const transverseElementsPageId =
  auditStore.currentAudit?.transverseElementsPage.id;

const isChecked = computed(() =>
  resultsStore
    .getTopicResults(props.pageId, props.topicNumber)
    .every((r) => r.status === CriteriumResultStatus.NOT_APPLICABLE)
);

const switchValue = ref(isChecked.value);

const route = useRoute();
const uniqueId = route.params.uniqueId as string;

watch(isChecked, (isChecked) => {
  switchValue.value = isChecked;
});

watch(switchValue, (switchValue) => {
  if (switchValue === isChecked.value) {
    return;
  }

  if (switchValue) {
    resultsStore.setTopicStatus(
      uniqueId,
      props.pageId,
      props.topicNumber,
      CriteriumResultStatus.NOT_APPLICABLE
    );
  } else {
    resultsStore.revertTopicStatus(uniqueId, props.pageId, props.topicNumber);
  }
});

const inputRef = ref<HTMLInputElement>();

function focusInput() {
  inputRef.value?.focus();
}
</script>

<template>
  <div class="fr-toggle fr-toggle--label-left">
    <input
      :id="`topic-switch-${topicNumber}`"
      ref="inputRef"
      v-model="switchValue"
      type="checkbox"
      class="fr-toggle__input"
      :disabled="isOffline"
    />
    <label class="fr-toggle__label" :for="`topic-switch-${topicNumber}`">
      <span class="fr-sr-only">Thématique {{ topicTitle }}</span>
      Non applicable
      {{
        pageId === transverseElementsPageId
          ? "pour les éléments transverses"
          : "sur la page"
      }}
    </label>
  </div>
</template>

<style scoped>
/* Override fr-toggle margin between label and toggle */
.fr-toggle--label-left .fr-toggle__label::before {
  margin-left: 0.5rem !important;
}
</style>
