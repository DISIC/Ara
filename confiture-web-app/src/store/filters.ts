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

      /**
       * Filter based on search on:
       * - topic title ("Images")
       * - criteria title ("Dans chaque page web, l’ouverture...")
       */
      filteredTopics = filteredTopics.map((t) => {
        return {
          ...t,
          criteria: t.criteria.filter(
            (c: any) =>
              c.criterium.title
                .toLowerCase()
                .includes(this.search.toLowerCase()) ||
              t.topic.toLowerCase().includes(this.search.toLocaleLowerCase())
          ),
        };
      });

      filteredTopics = filteredTopics.filter((t) => t.criteria.length);

      return filteredTopics;
    },
  },
});
