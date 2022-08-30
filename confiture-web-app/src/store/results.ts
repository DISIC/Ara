import { defineStore } from "pinia";
import ky from "ky";
import { sample } from "lodash-es";

import {
  CriteriumResult,
  CriteriumResultStatus,
  CriterionResultUserImpact,
} from "../types";

interface ResultsStoreState {
  results: CriteriumResult[] | null;
}

export const useResultsStore = defineStore("results", {
  state: (): ResultsStoreState => ({ results: null }),

  getters: {
    getCriteriumResult() {
      return (
        pageUrl: string,
        topicNumber: number,
        criteriumNumber: number
      ) => {
        return this.results?.find((r) => {
          return (
            r.pageUrl === pageUrl &&
            r.topic === topicNumber &&
            r.criterium === criteriumNumber
          );
        });
      };
    },
  },

  actions: {
    async fetchResults(uniqueId: string) {
      const data = (await ky
        .get(`/api/audits/${uniqueId}/results`)
        .json()) as CriteriumResult[];
      this.results = data;
    },
    async updateResults(uniqueId: string, updates: CriteriumResult[]) {
      // FIXME: remove this line. for debugging purpose
      throw new Error("Pouet");

      // await ky.patch(`/api/audits/${uniqueId}/results`, {
      //   json: {
      //     data: updates,
      //   },
      // });

      // if (!this.results) {
      //   return;
      // }

      // for (let i = 0; i < this.results.length; i++) {
      //   const element = this.results[i];
      //   updates.forEach((update) => {
      //     if (
      //       update.pageUrl === element.pageUrl &&
      //       update.topic === element.topic &&
      //       update.criterium === element.criterium
      //     ) {
      //       this.results?.splice(i, 1, update);
      //     }
      //   });
      // }
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
