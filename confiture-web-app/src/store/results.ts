import { defineStore } from "pinia";
import ky from "ky";
import { has, sample, set, setWith, unset } from "lodash-es";

import {
  CriteriumResult,
  CriteriumResultStatus,
  CriterionResultUserImpact,
} from "../types";

type PageUrl = string;
type TopicNumber = number;
type CriteriumNumber = number;

interface ResultsStoreState {
  data: {
    [key: PageUrl]: {
      [key: TopicNumber]: {
        [key: CriteriumNumber]: CriteriumResult;
      };
    };
  } | null;

  previousStatuses: {
    [key: PageUrl]: {
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
    getCriteriumResult() {
      return (
        pageUrl: string,
        topicNumber: number,
        criteriumNumber: number
      ) => {
        if (
          !this.data ||
          !this.data[pageUrl] ||
          !this.data[pageUrl][topicNumber] ||
          !this.data[pageUrl][topicNumber][criteriumNumber]
        ) {
          return;
        }

        return this.data[pageUrl][topicNumber][criteriumNumber];
      };
    },

    getTopicResults() {
      return (pageUrl: string, topicNumber: number) => {
        if (
          !this.data ||
          !this.data[pageUrl] ||
          !this.data[pageUrl][topicNumber]
        ) {
          return [];
        }

        return Object.values(this.data[pageUrl][topicNumber]);
      };
    },

    allResults(): CriteriumResult[] | undefined {
      if (!this.data) {
        return;
      }
      return Object.values(this.data)
        .map((page) => Object.values(page).map((topic) => Object.values(topic)))
        .flat(2);
    },

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
        if (!(r.pageUrl in data)) {
          data[r.pageUrl] = {};
        }

        if (!(r.topic in data[r.pageUrl])) {
          data[r.pageUrl][r.topic] = {};
        }

        data[r.pageUrl][r.topic][r.criterium] = r;
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
        this.data![update.pageUrl][update.topic][update.criterium] = update;
      });
    },

    async setTopicStatus(
      uniqueId: string,
      pageUrl: string,
      topicNumber: number,
      status: CriteriumResultStatus
    ) {
      const results = this.getTopicResults(pageUrl, topicNumber);

      if (status === CriteriumResultStatus.NOT_APPLICABLE) {
        results.forEach((r) => {
          setWith(
            this.previousStatuses,
            [r.pageUrl, r.topic, r.criterium],
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

    async revertTopicStatus(
      uniqueId: string,
      pageUrl: string,
      topicNumber: number
    ) {
      if (has(this.previousStatuses, [pageUrl, topicNumber])) {
        const updates = Object.entries(
          this.previousStatuses[pageUrl][topicNumber]
        ).map(([criterium, status]) => {
          return {
            ...this.getCriteriumResult(
              pageUrl,
              topicNumber,
              Number(criterium)
            )!,
            status,
          };
        });
        await this.updateResults(uniqueId, updates);
        unset(this.previousStatuses, [pageUrl, topicNumber]);
      } else {
        await this.setTopicStatus(
          uniqueId,
          pageUrl,
          topicNumber,
          CriteriumResultStatus.NOT_TESTED
        );
      }
    },

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
