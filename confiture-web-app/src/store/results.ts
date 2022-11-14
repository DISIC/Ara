import { defineStore } from "pinia";
import ky from "ky";
import { has, sample, setWith, unset } from "lodash-es";

import {
  CriteriumResult,
  CriteriumResultStatus,
  CriterionResultUserImpact,
} from "../types";
import { useAuditStore } from "./audit";

type PageId = number;
type TopicNumber = number;
type CriteriumNumber = number;

interface ResultsStoreState {
  data: {
    [key: PageId]: {
      [key: TopicNumber]: {
        [key: CriteriumNumber]: CriteriumResult;
      };
    };
  } | null;

  /**
   * Store the statuses history when using the "Topic not applicable"
   * switch in case of a misclick.
   */
  previousStatuses: {
    [key: PageId]: {
      [key: TopicNumber]: {
        [key: CriteriumNumber]: CriteriumResultStatus;
      };
    };
  };
}

export const useResultsStore = defineStore("results", {
  state: (): ResultsStoreState => ({
    data: null,
    previousStatuses: {},
  }),

  getters: {
    /**
     * @returns A single criterium result if it is available, undefined otherwise.
     */
    getCriteriumResult() {
      return (pageId: number, topicNumber: number, criteriumNumber: number) => {
        if (
          !this.data ||
          !this.data[pageId] ||
          !this.data[pageId][topicNumber] ||
          !this.data[pageId][topicNumber][criteriumNumber]
        ) {
          return;
        }

        return this.data[pageId][topicNumber][criteriumNumber];
      };
    },

    /**
     * @returns A getter returning all the results concerning a particular topic on a particular audited page.
     */
    getTopicResults() {
      return (pageId: number, topicNumber: number) => {
        if (
          !this.data ||
          !this.data[pageId] ||
          !this.data[pageId][topicNumber]
        ) {
          return [];
        }

        return Object.values(this.data[pageId][topicNumber]);
      };
    },

    /**
     * @returns Every results in a list. Or undefined if the data is not fetched yet.
     */
    allResults(): CriteriumResult[] | undefined {
      if (!this.data) {
        return;
      }
      return Object.values(this.data)
        .map((page) => Object.values(page).map((topic) => Object.values(topic)))
        .flat(2);
    },

    /**
     * @returns True when every criterium in the audit have been tested (status is different from NOT_TESTED)
     */
    everyCriteriumAreTested(): boolean {
      return (
        !this.allResults?.some(
          (r) => r.status === CriteriumResultStatus.NOT_TESTED
        ) ?? false
      );
    },
  },

  actions: {
    async fetchResults(uniqueId: string) {
      const response = (await ky
        .get(`/api/audits/${uniqueId}/results`)
        .json()) as CriteriumResult[];

      const data: ResultsStoreState["data"] = {};

      response.forEach((r) => {
        if (!(r.pageId in data)) {
          data[r.pageId] = {};
        }

        if (!(r.topic in data[r.pageId])) {
          data[r.pageId][r.topic] = {};
        }

        data[r.pageId][r.topic][r.criterium] = r;
      });

      this.data = data;
    },

    async updateResults(uniqueId: string, updates: CriteriumResult[]) {
      await ky.patch(`/api/audits/${uniqueId}/results`, {
        json: {
          data: updates,
        },
      });

      if (!this.data) {
        return;
      }

      updates.forEach((update) => {
        this.data![update.pageId][update.topic][update.criterium] = update;
      });

      // update the edition date of the local audit. It will not be the same
      // value as the one stored in the DB but it is close enough in our case
      const auditStore = useAuditStore();
      if (auditStore.data) {
        auditStore.data.editionDate = new Date().toISOString();
      }
    },

    /**
     * Send a batch of updates to the API setting the status of every
     * criterium of a particular topic in a particular audited page to the
     * given value.
     *
     * Also save the current status values in order to revert the change if needed.
     */
    async setTopicStatus(
      uniqueId: string,
      pageId: number,
      topicNumber: number,
      status: CriteriumResultStatus
    ) {
      const results = this.getTopicResults(pageId, topicNumber);

      if (status === CriteriumResultStatus.NOT_APPLICABLE) {
        results.forEach((r) => {
          setWith(
            this.previousStatuses,
            [r.pageId, r.topic, r.criterium],
            r.status,
            Object
          );
        });
      }

      const updates = results.map((r) => ({
        ...r,
        status,
      }));

      await this.updateResults(uniqueId, updates);
    },

    /**
     * Send a batch of updates to the API setting the status of every
     * criterium of a particular topic in a particular audited page to the
     * values they had at the time of calling setTopicStatus().
     *
     * If there are no previous values saved, all statuses are set to NOT_TESTED.
     */
    async revertTopicStatus(
      uniqueId: string,
      pageId: number,
      topicNumber: number
    ) {
      if (has(this.previousStatuses, [pageId, topicNumber])) {
        const updates = Object.entries(
          this.previousStatuses[pageId][topicNumber]
        ).map(([criterium, status]) => {
          return {
            ...this.getCriteriumResult(pageId, topicNumber, Number(criterium))!,
            status,
          };
        });
        await this.updateResults(uniqueId, updates);
        unset(this.previousStatuses, [pageId, topicNumber]);
      } else {
        await this.setTopicStatus(
          uniqueId,
          pageId,
          topicNumber,
          CriteriumResultStatus.NOT_TESTED
        );
      }
    },

    /**
     * Fill the entire audit with random values for debugging purpose.
     */
    async DEV_fillResults(uniqueId: string) {
      const updates =
        this.allResults?.map((r) => ({
          ...r,
          /* eslint-disable @typescript-eslint/no-non-null-assertion */
          status: sample([
            CriteriumResultStatus.COMPLIANT,
            CriteriumResultStatus.NOT_COMPLIANT,
            CriteriumResultStatus.NOT_APPLICABLE,
          ])!,
          compliantComment: sample(["Commentaire conforme", "Rien"])!,
          errorDescription: sample(["Commentaire non conforme", "Rien"])!,
          notApplicableComment: sample(["Commentaire non-applicable", "Rien"])!,
          recommandation: sample(["Recommandation", "Rien"])!,
          userImpact: sample(CriterionResultUserImpact)!,
          /* eslint-enable @typescript-eslint/no-non-null-assertion */
        })) ?? [];

      await this.updateResults(uniqueId, updates);
    },
  },
});
