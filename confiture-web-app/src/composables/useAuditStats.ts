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

  const isCompliant = (c: CriteriumResult) =>
    c.status === CriteriumResultStatus.COMPLIANT;

  const isNotCompliant = (c: CriteriumResult) =>
    c.status === CriteriumResultStatus.NOT_COMPLIANT;

  const isNotApplicable = (c: CriteriumResult) =>
    c.status === CriteriumResultStatus.NOT_APPLICABLE;

  const isNotTested = (c: CriteriumResult) =>
    c.status === CriteriumResultStatus.NOT_TESTED;

  const isTransverse = (c: CriteriumResult) =>
    c.pageId === auditStore.currentAudit?.transverseElementsPage.id;

  const applicableCriteria = computed(() => {
    return Object.values(groupedCriteria.value).filter((criteria) =>
      criteria.some((c) => isCompliant(c) || isNotCompliant(c))
    );
  });

  const compliantCriteria = computed(() => {
    return applicableCriteria.value.filter((criteria) => {
      // remove untested transverse criterion
      const withoutUntestedTrans = criteria.filter(
        (c) => !(isTransverse(c) && isNotTested(c))
      );

      return (
        withoutUntestedTrans.some((c) => isCompliant(c)) &&
        withoutUntestedTrans.every((c) => isCompliant(c) || isNotApplicable(c))
      );
    });
  });

  const notCompliantCriteria = computed(() => {
    return applicableCriteria.value.filter((criteria) => {
      return criteria.some((c) => isNotCompliant(c));
    });
  });

  const notApplicableCriteria = computed(() => {
    return Object.values(groupedCriteria.value).filter((criteria) => {
      // remove untested transverse criterion
      const withoutUntestedTrans = criteria.filter(
        (c) => !isTransverse(c) && isNotTested(c)
      );

      return withoutUntestedTrans.every((c) => isNotApplicable(c));
    });
  });

  const blockingCriteria = computed(() => {
    return notCompliantCriteria.value.filter((criteria) => {
      return criteria.some(
        (c) => c.userImpact === CriterionResultUserImpact.BLOCKING
      );
    });
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

  const complianceLevel = computed(() => {
    return (
      Math.round(
        (compliantCriteria.value.length / applicableCriteria.value.length) * 100
      ) || 0
    );
  });

  return {
    applicableCriteriaCount: computed(() => applicableCriteria.value.length),
    compliantCriteriaCount: computed(() => compliantCriteria.value.length),
    notCompliantCriteriaCount: computed(
      () => notCompliantCriteria.value.length
    ),
    notApplicableCriteriaCount: computed(
      () => notApplicableCriteria.value.length
    ),
    blockingCriteriaCount: computed(() => blockingCriteria.value.length),
    errorsCount,
    complianceLevel
  };
}
