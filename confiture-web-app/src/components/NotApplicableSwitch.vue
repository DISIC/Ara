<script lang="ts" setup>
import { result } from "lodash";
import { watch, computed, ref } from "vue";
import { useRoute } from "vue-router";
import { useResultsStore } from "../store";
import { CriteriumResultStatus } from "../types";

const props = defineProps<{
  pageUrl: string;
  topicNumber: number;
}>();

const resultsStore = useResultsStore();

const isChecked = computed(() =>
  resultsStore
    .getTopicResults(props.pageUrl, props.topicNumber)
    .every((r) => r.status === CriteriumResultStatus.NOT_APPLICABLE)
);

const switchValue = ref(isChecked.value);

const route = useRoute();
const uniqueId = route.params.uniqueId as string;

watch(switchValue, (switchValue) => {
  if (switchValue) {
    resultsStore.setTopicStatus(
      uniqueId,
      props.pageUrl,
      props.topicNumber,
      CriteriumResultStatus.NOT_APPLICABLE
    );
  } else {
    resultsStore.revertTopicStatus(uniqueId, props.pageUrl, props.topicNumber);
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
      class="fr-toggle__label topic-switch-label"
      :for="`topic-switch-${topicNumber}`"
    >
      Non applicable sur la page
    </label>
  </div>
</template>

<style scoped>
.topic-switch-label {
  /* FIXME: seems there is a bug in DSFR when the
  label is on the left. There is no padding on it. */
  padding-right: 1rem;
}
</style>
