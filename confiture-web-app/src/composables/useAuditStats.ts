import { computed } from "vue";

import {
  CriteriumResultStatus,
  CriterionResultUserImpact,
  CriteriumResult,
  TransverseCriteriumResult
} from "../types";
import { useResultsStore } from "../store";

export function useAuditStats() {
  const store = useResultsStore();

  const groupedCriteria = computed(() => {
    return (
      store.allResults?.reduce<
        Record<string, (CriteriumResult | TransverseCriteriumResult)[]>
      >((acc, c) => {
        const key = `${c.topic}.${c.criterium}`;
        if (acc[key]) {
          acc[key].push(c);
        } else {
          acc[key] = [c];
        }
        return acc;
      }, {}) || {}
    );
  });

  const applicableCriteria = computed(() => {
    return Object.values(groupedCriteria.value).filter((criteria) =>
      criteria.some((c) => c.status !== CriteriumResultStatus.NOT_APPLICABLE)
    );
  });

  const notApplicableCriteriaCount = computed(() => {
    return Object.values(groupedCriteria.value).filter((criteria) => {
      return criteria.every((c) => c.status === "NOT_APPLICABLE");
    }).length;
  });

  const compliantCriteriaCount = computed(() => {
    return applicableCriteria.value.filter((criteria) =>
      criteria.every(
        (c) =>
          c.status === CriteriumResultStatus.COMPLIANT ||
          c.status === CriteriumResultStatus.NOT_APPLICABLE
      )
    ).length;
  });

  const notCompliantCriteriaCount = computed(() => {
    return applicableCriteria.value.filter((criteria) =>
      criteria.some((c) => c.status === CriteriumResultStatus.NOT_COMPLIANT)
    ).length;
  });

  const blockingCriteriaCount = computed(() => {
    return applicableCriteria.value.filter((criteria) =>
      criteria.some(
        (c) =>
          c.status === CriteriumResultStatus.NOT_COMPLIANT &&
          c.userImpact === CriterionResultUserImpact.BLOCKING
      )
    ).length;
  });

  const complianceLevel = computed(() => {
    const applicableCriteria = Object.values(groupedCriteria.value).filter(
      (criteria) =>
        criteria.some((c) => c.status !== CriteriumResultStatus.NOT_APPLICABLE)
    );

    const compliantCriteria = applicableCriteria.filter((criteria) =>
      criteria.every(
        (c) =>
          c.status === CriteriumResultStatus.COMPLIANT ||
          c.status === CriteriumResultStatus.NOT_APPLICABLE
      )
    );

    return (
      Math.round(
        (compliantCriteria.length / applicableCriteria.length) * 100
      ) || 0
    );
  });

  const errorsCount = computed(() => {
    const total =
      store.allResults?.filter((r) => {
        return r.status === CriteriumResultStatus.NOT_COMPLIANT;
      }).length || 0;

    const blocking =
      store.allResults?.filter((r) => {
        return (
          r.status === CriteriumResultStatus.NOT_COMPLIANT &&
          r.userImpact === CriterionResultUserImpact.BLOCKING
        );
      }).length || 0;

    return { total, blocking };
  });

  return {
    groupedCriteria,
    notApplicableCriteriaCount,
    compliantCriteriaCount,
    notCompliantCriteriaCount,
    blockingCriteriaCount,
    complianceLevel,
    errorsCount
  };
}
