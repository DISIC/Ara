import { computed } from "vue";

import { useAuditStore, useResultsStore } from "../store";
import {
  CriterionResultUserImpact,
  CriteriumResult,
  CriteriumResultStatus
} from "../types";

export function useAuditStats() {
  const auditStore = useAuditStore();
  const store = useResultsStore();

  const groupedCriteria = computed(() => {
    return (
      store.allResults?.reduce<Record<string, CriteriumResult[]>>((acc, c) => {
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
      criteria.some(
        (c) =>
          c.status !== CriteriumResultStatus.NOT_APPLICABLE &&
          c.status !== CriteriumResultStatus.NOT_TESTED
      )
    );
  });

  const notApplicableCriteriaCount = computed(() => {
    return Object.values(groupedCriteria.value).filter((criteria) => {
      return criteria
        .filter(
          (c) => c.pageId !== auditStore.currentAudit?.transverseElementsPage.id
        )
        .every((c) => c.status === CriteriumResultStatus.NOT_APPLICABLE);
    }).length;
  });

  const compliantCriteriaCount = computed(() => {
    return applicableCriteria.value.filter((criteria) => {
      return (
        criteria.some((c) => c.status === CriteriumResultStatus.COMPLIANT) &&
        criteria.every(
          (c) =>
            c.status === CriteriumResultStatus.COMPLIANT ||
            c.status === CriteriumResultStatus.NOT_APPLICABLE
        )
      );
    }).length;
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
      (criteria) => {
        return criteria.some(
          (c) =>
            c.status !== CriteriumResultStatus.NOT_APPLICABLE &&
            c.status !== CriteriumResultStatus.NOT_TESTED
        );
      }
    );

    const compliantCriteria = applicableCriteria.filter((criteria) => {
      return (
        criteria.some((c) => c.status === CriteriumResultStatus.COMPLIANT) &&
        criteria.every(
          (c) =>
            c.status === CriteriumResultStatus.COMPLIANT ||
            c.status === CriteriumResultStatus.NOT_APPLICABLE
        )
      );
    });

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
    applicableCriteriaCount: applicableCriteria,
    notApplicableCriteriaCount,
    compliantCriteriaCount,
    notCompliantCriteriaCount,
    blockingCriteriaCount,
    complianceLevel,
    errorsCount
  };
}
