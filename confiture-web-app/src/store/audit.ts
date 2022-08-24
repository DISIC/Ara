import ky from "ky";
import { defineStore } from "pinia";
import {
  Audit,
  CreateAuditRequestData,
  UpdateAuditRequestData,
} from "../types";

interface AuditStoreState {
  data: Audit | null;
}

export const useAuditStore = defineStore("audit", {
  state: (): AuditStoreState => ({
    data: null,
  }),
  actions: {
    async createAudit(data: CreateAuditRequestData): Promise<Audit> {
      const response = (await ky
        .post("/api/audits", {
          json: data,
        })
        .json()) as Audit;
      return response;
    },

    async fetchAudit(editUniqueId: string) {
      const data = (await ky
        .get(`/api/audits/${editUniqueId}`)
        .json()) as Audit;
      this.data = data;
    },

    async fetchAuditIfNeeded(editUniqueId: string) {
      if (editUniqueId === this.data?.editUniqueId) {
        return;
      }
      await this.fetchAudit(editUniqueId);
    },

    async updateAudit(
      uniqueId: string,
      data: UpdateAuditRequestData
    ): Promise<Audit> {
      const response = (await ky
        .put(`/api/audits/${uniqueId}`, {
          json: data,
        })
        .json()) as Audit;
      this.data = response;
      return response;
    },

    async deleteAudit(uniqueId: string): Promise<void> {
      await ky.delete(`/api/audits/${uniqueId}`);
    },

    async publishAudit(uniqueId: string): Promise<Audit> {
      const response = (await ky
        .put(`/api/audits/${uniqueId}/publish`)
        .json()) as Audit;
      this.data = response;
      return response;
    },
  },
});
