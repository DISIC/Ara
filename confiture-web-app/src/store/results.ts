import { defineStore } from "pinia";
import ky from "ky";
import { sample, update } from "lodash-es";

import {
  CriteriumResult,
  CriteriumResultStatus,
  CriterionResultUserImpact,
} from "../types";

type PageUrl = string;
type TopicNumber = number;
type CriteriumNumber = number;

interface ResultsStoreState {
  results: CriteriumResult[] | null;
  data: {
    [key: PageUrl]: {
      [key: TopicNumber]: {
        [key: CriteriumNumber]: CriteriumResult;
      };
    };
  } | null;
}

export const useResultsStore = defineStore("results", {
  state: (): ResultsStoreState => ({
    results: null,
    data: null,
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
        return (
          this.results?.filter((r) => {
            return r.pageUrl === pageUrl && r.topic === topicNumber;
          }) ?? []
        );
      };
    },
  },

  actions: {
    async fetchResults(uniqueId: string) {
      const response = (await ky
        .get(`/api/audits/${uniqueId}/results`)
        .json()) as CriteriumResult[];
      this.results = response;

      const data: ResultsStoreState["data"] = {};
      this.results.forEach((r) => {
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

      if (!this.results) {
        return;
      }

      for (let i = 0; i < this.results.length; i++) {
        const element = this.results[i];
        updates.forEach((update) => {
          if (
            update.pageUrl === element.pageUrl &&
            update.topic === element.topic &&
            update.criterium === element.criterium
          ) {
            this.results?.splice(i, 1, update);
          }
        });
      }

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
      const updates =
        this.results
          ?.filter((r) => r.pageUrl === pageUrl && r.topic === topicNumber)
          .map((r) => ({ ...r, status })) ?? [];
      await this.updateResults(uniqueId, updates);
    },

    async revertTopicStatus(
      uniqueId: string,
      pageUrl: string,
      topicNumber: number
    ) {
      await this.setTopicStatus(
        uniqueId,
        pageUrl,
        topicNumber,
        CriteriumResultStatus.NOT_TESTED
      );
    },

    async DEV_fillResults(uniqueId: string) {
      const updates =
        this.results?.map((r) => ({
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
