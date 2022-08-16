import { ref, computed } from "vue";

import {
  CriteriumResult,
  CriteriumResultStatus,
  CriterionResultUserImpact,
} from "../types";

export async function useAuditStats(results: CriteriumResult[] | null) {
  const applicableCriteriaCount = ref(34);

  // FIXME: calculate compliance by dedoubling criteria (compliance accross all pages)
  const complianceLevel = computed(() => {
    const testedCount =
      results?.filter(
        (result) =>
          result.status !== CriteriumResultStatus.NOT_TESTED &&
          result.status !== CriteriumResultStatus.NOT_APPLICABLE
      ).length ?? 0;

    const compliantCount =
      results?.filter(
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
      results?.filter((r) => {
        return r.status === CriteriumResultStatus.NOT_COMPLIANT;
      }).length || 0;

    const blocking =
      results?.filter((r) => {
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
