import { defineStore } from "pinia";
import rgaa from "../criteres.json";
import { CRITERIA_BY_AUDIT_TYPE } from "../criteria";
import { AuditType, CriteriumResultStatus } from "../types";
import { useAuditStore } from "./audit";
import { useResultsStore } from "./results";

interface FiltersStoreState {
  search: string;
  hideEvaluatedCriteria: boolean;
  hideTestsAndReferences: boolean;
  newEvaluatedCriteria: string[];
  complianceLevels: CriteriumResultStatus[];
}

export const useFiltersStore = defineStore("filters", {
  state: (): FiltersStoreState => ({
    search: "",
    hideEvaluatedCriteria: false,
    hideTestsAndReferences: false,
    newEvaluatedCriteria: [],
    complianceLevels: [],
  }),
  getters: {
    /** Filter topics by topic name and by search. */
    filteredTopics() {
      const resultStore = useResultsStore();
      const auditStore = useAuditStore();
      const auditType = auditStore.data?.auditType ?? AuditType.FULL;

      let filteredTopics = rgaa.topics as any[];

      /**
       * Filter based on:
       * - already evaluated criteria
       * - which are not in newEvaluatedCriteria
       */
      if (this.hideEvaluatedCriteria && resultStore.data) {
        filteredTopics = filteredTopics.map((t) => {
          return {
            ...t,
            criteria: t.criteria
              .map((c: any) => {
                return {
                  ...c,
                  status:
                    resultStore.data?.[auditStore.currentPageId!]?.[t.number]?.[
                      c.criterium.number
                    ]?.status,
                };
              })
              .filter((c: any) => {
                return (
                  c.status === CriteriumResultStatus.NOT_TESTED ||
                  this.newEvaluatedCriteria.includes(
                    `${auditStore.currentPageId}.${t.number}.${c.criterium.number}`
                  )
                );
              }),
          };
        });
      }

      /**
       * Filter based on search on:
       * - topic title ("Images")
       * - criteria title ("Dans chaque page web, l’ouverture...")
       * - audit type (fast, complementary, full)
       * - result (compliant, not compliant, not applicable)
       */
      filteredTopics = filteredTopics.map((t) => {
        return {
          ...t,
          criteria: t.criteria
            .map((c: any) => {
              return {
                ...c,
                status:
                  resultStore.data?.[auditStore.currentPageId!]?.[t.number]?.[
                    c.criterium.number
                  ]?.status,
              };
            })
            .filter(
              (c: any) =>
                // audit type filter
                !!CRITERIA_BY_AUDIT_TYPE[auditType].find(
                  (fc) =>
                    fc.criterium === c.criterium.number && fc.topic === t.number
                ) &&
                // status
                (this.complianceLevels.length
                  ? this.complianceLevels.includes(c.status)
                  : !this.complianceLevels.includes(c.status)) &&
                // search filter
                (c.criterium.title
                  .toLowerCase()
                  .includes(this.search.toLowerCase()) ||
                  t.topic
                    .toLowerCase()
                    .includes(this.search.toLocaleLowerCase()))
            ),
        };
      });

      filteredTopics = filteredTopics.filter((t) => t.criteria.length);

      return filteredTopics;
    },
    hasNoResultsFromSearch(): boolean {
      const filteredTopics = rgaa.topics as any[];

      return !filteredTopics.some((t) => {
        return (
          t.topic.toLowerCase().includes(this.search.toLocaleLowerCase()) ||
          t.criteria.some((c: any) => {
            return c.criterium.title
              .toLowerCase()
              .includes(this.search.toLowerCase());
          })
        );
      });
    },
    hasNoResultsFromComplianceLevel(): boolean {
      if (!this.complianceLevels.length) {
        return false;
      }

      const auditStore = useAuditStore();
      const resultStore = useResultsStore();

      const pageResults = resultStore.data?.[auditStore.currentPageId!];

      return Object.values(pageResults!)
        .map((topic) => {
          return Object.values(topic).map((c) => c.status);
        })
        .flat(2)
        .every((status) => {
          return !this.complianceLevels.includes(status);
        });
    },
    hasNoResultsFromEvaluated(): boolean {
      const auditStore = useAuditStore();
      const resultStore = useResultsStore();

      const pageResults = resultStore.data?.[auditStore.currentPageId!];

      return Object.values(pageResults!)
        .map((topic) => {
          return Object.values(topic).map((c) => c.status);
        })
        .flat(2)
        .every((status) => {
          return status !== CriteriumResultStatus.NOT_TESTED;
        });
    },
  },
  actions: {
    updateEvaluatedCriteria() {
      this.newEvaluatedCriteria = [];
    },
  },
});
