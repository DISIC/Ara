import ky from "ky";
import { defineStore } from "pinia";
import {
  Audit,
  CreateAuditRequestData,
  UpdateAuditRequestData,
} from "../types";
import { AccountAudit } from "../types/account";
import { useAccountStore } from "./account";

interface AuditStoreState {
  lastVisitedStepLocation: string | null;
  currentPageId: number | null;
  showAuditEmailAlert: boolean;

  currentAuditId: string | null;
  entities: Record<string, Audit>;
  listing: AccountAudit[];
}

export const useAuditStore = defineStore("audit", {
  state: (): AuditStoreState => ({
    lastVisitedStepLocation: null,
    currentPageId: null,
    showAuditEmailAlert: false,

    currentAuditId: null,
    entities: {},
    listing: [],
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
      this.currentAuditId = editUniqueId;
      const data = (await ky
        .get(`/api/audits/${editUniqueId}`)
        .json()) as Audit;

      this.entities[editUniqueId] = data;
    },

    async fetchAuditIfNeeded(editUniqueId: string) {
      this.currentAuditId = editUniqueId;
      if (this.entities[editUniqueId]) {
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
      this.entities[uniqueId] = response;
      return response;
    },

    async updateAuditNotes(uniqueId: string, data: { notes?: string }) {
      const previousNotes = this.entities[uniqueId]?.notes;

      if (this.entities[uniqueId]) {
        this.entities[uniqueId].notes = data.notes ?? null;
      }

      try {
        await ky
          .patch(`/api/audits/${uniqueId}`, {
            json: data,
          })
          .json();
      } catch (error) {
        if (this.entities[uniqueId] && previousNotes) {
          this.entities[uniqueId].notes = previousNotes;
        }
        throw error;
      }
    },

    async deleteAudit(uniqueId: string): Promise<void> {
      await ky.delete(`/api/audits/${uniqueId}`);
      delete this.entities[uniqueId];
      this.listing = this.listing.filter(
        (audit) => audit.editUniqueId !== uniqueId
      );
      if (this.currentAuditId === uniqueId) {
        this.currentAuditId = null;
      }
    },

    async publishAudit(uniqueId: string): Promise<Audit> {
      const response = (await ky
        .put(`/api/audits/${uniqueId}/publish`)
        .json()) as Audit;
      this.entities[uniqueId] = response;
      return response;
    },

    /**
     * @param uniqueId Id of the audit to duplicate
     * @returns A promise to the unique id of the copy
     */
    async duplicateAudit(uniqueId: string, copyName: string): Promise<string> {
      // non-null because the original audit has to exist to have the "Copy" button clicked
      const originalAuditListingItem = this.listing.find(
        (audit) => audit.editUniqueId === uniqueId
      )!;

      const newAudit = (await ky
        .post(`/api/audits/${uniqueId}/duplicate`, {
          json: {
            procedureName: copyName,
          },
          // Duplicating an audit can be a pretty long process
          timeout: false,
        })
        .json()) as Audit;

      const newAuditListItem: AccountAudit = {
        auditType: newAudit.auditType,
        complianceLevel: originalAuditListingItem.complianceLevel,
        consultUniqueId: newAudit.consultUniqueId,
        creationDate: newAudit.creationDate!,
        editUniqueId: newAudit.editUniqueId,
        procedureName: newAudit.procedureName,
        status: originalAuditListingItem.status,
        estimatedCsvSize: originalAuditListingItem.estimatedCsvSize,
      };

      this.listing.push(newAuditListItem);

      return newAudit.editUniqueId;
    },

    // FIXME: move this to filter store?
    async updateCurrentPageId(id: number | null) {
      this.currentPageId = id;
    },

    async fetchAudits() {
      const accountStore = useAccountStore();
      const audits = (await ky
        .get("/api/audits", {
          headers: { Authorization: `Bearer ${accountStore.authToken}` },
        })
        .json()) as AccountAudit[];

      this.listing = audits;
    },
  },
  getters: {
    currentAudit(state) {
      if (!state.currentAuditId) {
        return null;
      }
      return state.entities[state.currentAuditId];
    },
  },
});
