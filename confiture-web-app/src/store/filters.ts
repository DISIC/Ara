import { defineStore } from "pinia";
import rgaa from "../criteres.json";

interface FiltersStoreState {
  search: string;
  topics: number[];
}

export const useFiltersStore = defineStore("filters", {
  state: (): FiltersStoreState => ({ search: "", topics: [] }),
  getters: {
    /** Filter topics by topic name and by search. */
    filteredTopics() {
      let filteredTopics = rgaa.topics as any[];

      if (this.topics.length) {
        filteredTopics = rgaa.topics.filter((t) => {
          return this.topics.includes(t.number);
        });
      }

      filteredTopics = filteredTopics.map((t) => {
        return {
          ...t,
          criteria: t.criteria.filter((c: any) =>
            c.criterium.title.toLowerCase().includes(this.search.toLowerCase())
          ),
        };
      });

      filteredTopics = filteredTopics.filter((t) => t.criteria.length);

      return filteredTopics;
    },
  },
});
