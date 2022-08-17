import { computed } from "vue";
import { countBy } from "lodash-es";
import { storeToRefs } from "pinia";

import { CriteriumResultStatus, CriterionResultUserImpact } from "../types";
import { useResultsStore } from "../store";

// TODO: get pagesCount directly from the store
export function useAuditStats(pagesCount: number | undefined) {
  const store = useResultsStore();
  const { results } = storeToRefs(store);

  const applicableCriteriaCount = computed(
    () =>
      Object.values(
        countBy(
          results.value
            ?.filter((r) => {
              return r.status === CriteriumResultStatus.NOT_APPLICABLE;
            })
            .map((r) => {
              return { ...r, tc: `${r.topic}.${r.criterium}` };
            }),
          (r) => r.tc
        )
      ).filter((r) => r !== pagesCount).length
  );

  // FIXME: calculate compliance by dedoubling criteria (compliance accross all pages)
  const complianceLevel = computed(() => {
    const testedCount =
      results.value?.filter(
        (result) =>
          result.status !== CriteriumResultStatus.NOT_TESTED &&
          result.status !== CriteriumResultStatus.NOT_APPLICABLE
      ).length ?? 0;

    const compliantCount =
      results.value?.filter(
        (result) => result.status === CriteriumResultStatus.COMPLIANT
      ).length ?? 0;

    if (testedCount === 0) {
      return 0;
    }

    return Math.round((compliantCount / testedCount) * 100);
  });

  const risk = computed(() => {
    if (complianceLevel.value < 50) {
      return "Élevé";
    } else if (complianceLevel.value < 75) {
      return "Moyen";
    } else {
      return "Bas";
    }
  });

  const errorsCount = computed(() => {
    const total =
      results.value?.filter((r) => {
        return r.status === CriteriumResultStatus.NOT_COMPLIANT;
      }).length || 0;

    const blocking =
      results.value?.filter((r) => {
        return (
          r.status === CriteriumResultStatus.NOT_COMPLIANT &&
          r.userImpact === CriterionResultUserImpact.BLOCKING
        );
      }).length || 0;

    return { total, blocking };
  });

  return {
    applicableCriteriaCount,
    complianceLevel,
    risk,
    errorsCount,
  };
}
