import ky from "ky";
import { defineStore } from "pinia";

import { AuditReport } from "../types";

export interface ReportStoreState {
  data: AuditReport | null;
}

export const useReportStore = defineStore("report", {
  state: (): ReportStoreState => ({
    data: null
  }),
  actions: {
    async fetchReport(consultUniqueId: string) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const data = (await ky
        .get(`/api/reports/${consultUniqueId}`, {
          // large audits can take a while to be fetched on slow connection
          timeout: 15_000
        })
        .json()) as AuditReport;
      this.data = data;
    }
  }
});
