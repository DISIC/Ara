import { defineStore } from "pinia";
import ky from "ky";

import { CriteriumResult } from "../types";

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
        const r = this.results?.find((r) => {
          return (
            r.pageUrl === pageUrl &&
            r.topic === topicNumber &&
            r.criterium === criteriumNumber
          );
        });
        console.log("🚀 ~ file: index.ts ~ line 27 ~ r ~ r", r);

        return r;
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
    },
  },
});
