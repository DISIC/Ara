import ky from "ky";
import { defineStore } from "pinia";
import {
  Audit,
  CreateAuditRequestData,
  UpdateAuditRequestData,
} from "../types";

interface AuditStoreState {
  data: Audit | null;
  lastVisitedStepLocation: string | null;
  currentPageId: number | null;
  showAuditEmailAlert: boolean;
}

export const useAuditStore = defineStore("audit", {
  state: (): AuditStoreState => ({
    data: null,
    lastVisitedStepLocation: null,
    currentPageId: null,
    showAuditEmailAlert: false,
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

    async updateAuditNotes(uniqueId: string, data: { notes?: string }) {
      const previousNotes = this.data?.notes;

      if (this.data) {
        this.data.notes = data.notes ?? null;
      }

      try {
        await ky
          .patch(`/api/audits/${uniqueId}`, {
            json: data,
          })
          .json();
      } catch (error) {
        if (this.data && previousNotes) {
          this.data.notes = previousNotes;
        }
        throw error;
      }
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

    /**
     * @param uniqueId Id of the audit to duplicate
     * @returns A promise to the unique id of the copy
     */
    async duplicateAudit(uniqueId: string, copyName: string): Promise<string> {
      const newAuditId = (await ky
        .post(`/api/audits/${uniqueId}/duplicate`, {
          json: {
            procedureName: copyName,
          },
          // Duplicating an audit can be a pretty long process
          timeout: false,
        })
        .text()) as string;
      return newAuditId;
    },

    async updateCurrentPageId(id: number | null) {
      this.currentPageId = id;
    },
  },
});
