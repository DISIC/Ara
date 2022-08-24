import ky from "ky";
import { defineStore } from "pinia";

import { AuditReport } from "../types";

interface ReportStoreState {
  data: AuditReport | null;
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
        .json()) as AuditReport;
      this.data = data;
    },
  },
});
