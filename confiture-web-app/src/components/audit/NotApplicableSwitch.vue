<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";

import { useIsOffline } from "../../composables/useIsOffline";
import { useNotifications } from "../../composables/useNotifications";
import { useAuditStore, useResultsStore } from "../../store";
import { AuditType, CriteriumResultStatus } from "../../types";

const props = defineProps<{
  pageId: number;
  topicNumber: number;
  topicTitle: string;
}>();

defineEmits<{
  toggle: [value: boolean];
}>();

defineExpose({ focusInput });

const isOffline = useIsOffline();
const notify = useNotifications();

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

watch(switchValue, async (switchValue) => {
  if (switchValue === isChecked.value) {
    return;
  }

  if (switchValue) {
    await resultsStore.setTopicStatus(
      uniqueId,
      props.pageId,
      props.topicNumber,
      CriteriumResultStatus.NOT_APPLICABLE
    );

    if (resultsStore.everyCriteriumAreTested) {
      auditStore.publishAudit(uniqueId);

      if (!auditStore.currentAudit?.publicationDate) {
        notify(
          "info",
          "Bravo ! Vous êtes sur le point de terminer votre audit 🎉",
          auditStore.currentAudit?.auditType === AuditType.FULL
            ? "Une fois le dernier critère complété, vous pourrez livrer votre rapport d’audit et rédiger la déclaration d’accessibilité."
            : "Une fois le dernier critère complété, vous pourrez livrer votre rapport d’audit",
          {
            link: {
              label: "Accéder aux livrables",
              to: {
                name: "audit-overview",
                params: { uniqueId: uniqueId }
              }
            }
          }
        );
      }
    }
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
      @change="$emit('toggle', switchValue)"
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
