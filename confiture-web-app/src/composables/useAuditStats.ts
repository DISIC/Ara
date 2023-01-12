import { computed } from "vue";
import { countBy, uniqWith } from "lodash-es";

import {
  CriteriumResultStatus,
  CriterionResultUserImpact,
  CriteriumResult,
} from "../types";
import { useResultsStore } from "../store";

// TODO: get pagesCount directly from the store
export function useAuditStats(pagesCount: number | undefined) {
  const store = useResultsStore();

  const applicableCriteriaCount = computed(
    () =>
      Object.values(
        countBy(
          store.allResults
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

  const notApplicableCriteriaCount = computed(
    () =>
      Object.values(
        countBy(
          store.allResults
            ?.filter((r) => {
              return r.status === CriteriumResultStatus.NOT_APPLICABLE;
            })
            .map((r) => {
              return { ...r, tc: `${r.topic}.${r.criterium}` };
            }),
          (r) => r.tc
        )
      ).filter((r) => r === pagesCount).length
  );

  const notCompliantCriteriaCount = computed(
    () =>
      uniqWith(
        store.allResults?.filter((r) => {
          return r.status === CriteriumResultStatus.NOT_COMPLIANT;
        }),
        (a, b) => {
          return a.topic === b.topic && a.criterium === b.criterium;
        }
      ).length
  );

  const blockingCriteriaCount = computed(
    () =>
      uniqWith(
        store.allResults?.filter((r) => {
          return (
            r.status === CriteriumResultStatus.NOT_COMPLIANT &&
            r.userImpact === CriterionResultUserImpact.BLOCKING
          );
        }),
        (a, b) => {
          return a.topic === b.topic && a.criterium === b.criterium;
        }
      ).length
  );

  const complianceLevel = computed(() => {
    const groupedCriteria =
      store.allResults?.reduce<Record<string, CriteriumResult[]>>((acc, c) => {
        const key = `${c.topic}.${c.criterium}`;
        if (acc[key]) {
          acc[key].push(c);
        } else {
          acc[key] = [c];
        }
        return acc;
      }, {}) || {};

    const applicableCriteria = Object.values(groupedCriteria).filter(
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

    return Math.round(
      (compliantCriteria.length / applicableCriteria.length) * 100
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
    applicableCriteriaCount,
    notApplicableCriteriaCount,
    notCompliantCriteriaCount,
    blockingCriteriaCount,
    complianceLevel,
    errorsCount,
  };
}
