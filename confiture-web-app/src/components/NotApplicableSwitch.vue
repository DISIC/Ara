<script lang="ts" setup>
import { watch, computed, ref } from "vue";
import { useRoute } from "vue-router";
import { useResultsStore } from "../store";
import { CriteriumResultStatus } from "../types";

const props = defineProps<{
  pageId: number;
  topicNumber: number;
}>();

const resultsStore = useResultsStore();

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
</script>

<template>
  <div class="fr-toggle fr-toggle--label-left">
    <input
      :id="`topic-switch-${topicNumber}`"
      v-model="switchValue"
      type="checkbox"
      class="fr-toggle__input"
    />
    <label
      class="fr-toggle__label fr-pr-2w"
      :for="`topic-switch-${topicNumber}`"
    >
      Non applicable sur la page
    </label>
  </div>
</template>
