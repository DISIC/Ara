import { defineStore } from "pinia";

interface FiltersStoreState {
  search: string;
  topics: number[];
}

export const useFiltersStore = defineStore("filters", {
  state: (): FiltersStoreState => ({ search: "", topics: [] }),
});
