import ky from "ky";
import { defineStore } from "pinia";

interface ReportStoreState {
  data: any | null;
}

export const useReportStore = defineStore("report", {
  state: (): ReportStoreState => ({
    data: null,
  }),
  actions: {
    async fetchReport(consultUniqueId: string) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const data = (await ky
        .get(`/api/reports/${consultUniqueId}`)
        .json()) as object;
      this.data = data;
    },
  },
});
