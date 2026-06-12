import { sortBy } from "lodash-es";
import { defineStore } from "pinia";

import { api } from "../api";
import { topicAccordionsStatus } from "../composables/useTopicAccordionsStatus";
import router from "../router";
import {
  Audit,
  NotesFile,
  CreateAuditRequestData,
  UpdateAuditRequestData,
  UpdateAuditStatementRequestData
} from "../types";
import { AccountAudit } from "../types/account";

const getLastRequestTimestampStorageKey = (auditId: string) =>
  `confiture:lastNotesRequestTimestamp:${auditId}`;

interface AuditStoreState {
  currentPageId: number | null;
  showAuditEmailAlert: boolean;

  entities: Record<string, Audit>;
  listing: AccountAudit[];

  /**
   * Number of update requests actually loading.
   *
   * When 0, nothing is loading.
   * When 1 or more, there's something loading.
   */
  currentRequestCount: number;

  /**
   * Timestamp of the last moment `currentRequestCount` changed from a non-zero value to zero.
   */
  lastRequestSuccessEnd: number | null;
  lastRequestFailed: boolean;

  topicAccordionsStatus: topicAccordionsStatus;
}

export const useAuditStore = defineStore("audit", {
  state: (): AuditStoreState => ({
    currentPageId: null,
    showAuditEmailAlert: false,

    entities: {},
    listing: [],
    currentRequestCount: 0,
    lastRequestSuccessEnd: null,
    lastRequestFailed: false,
    topicAccordionsStatus: {}
  }),
  actions: {
    async createAudit(data: CreateAuditRequestData): Promise<Audit> {
      const response = (await api
        .post("/api/audits", {
          json: data
        })
        .json()) as Audit;
      return response;
    },

    setAudit(id: string, audit: Audit) {
      this.entities[id] = {
        ...audit,
        pages: sortBy(audit.pages, "order")
      };
    },

    async fetchAudit(editUniqueId: string) {
      const data = (await api
        .get(`/api/audits/${editUniqueId}`)
        .json()) as Audit;

      this.setAudit(editUniqueId, data);
    },

    async fetchAuditIfNeeded(editUniqueId: string) {
      if (this.entities[editUniqueId]) {
        return;
      }
      await this.fetchAudit(editUniqueId);
    },

    async updateAudit(
      uniqueId: string,
      data: UpdateAuditRequestData
    ): Promise<Audit> {
      const response = (await api
        .put(`/api/audits/${uniqueId}`, {
          json: data
        })
        .json()) as Audit;
      this.setAudit(uniqueId, response);
      return response;
    },

    async updateAuditStatement(
      editUniqueId: string,
      data: UpdateAuditStatementRequestData
    ): Promise<Audit> {
      const response = (await api
        .put(`/api/audits/${editUniqueId}/statement`, {
          json: data
        })
        .json()) as Audit;
      this.setAudit(editUniqueId, response);
      return response;
    },

    async updateAuditNotes(uniqueId: string, data: { notes?: string }) {
      const previousNotes = this.entities[uniqueId]?.notes;

      if (this.entities[uniqueId]) {
        this.entities[uniqueId].notes = data.notes ?? null;
      }

      this.increaseCurrentRequestCount();

      await api
        .patch(`/api/audits/${uniqueId}`, {
          json: data
        })
        .json()
        .then(() => {
          this.updateCurrentAuditEditionDate();
        })
        .catch((error) => {
          if (this.entities[uniqueId] && previousNotes) {
            this.entities[uniqueId].notes = previousNotes;
          }
          throw error;
        })
        .finally(() => {
          this.decreaseCurrentRequestCount();
        });
    },

    async deleteAudit(uniqueId: string): Promise<void> {
      await api.delete(`/api/audits/${uniqueId}`);
      delete this.entities[uniqueId];
      this.listing = this.listing.filter(
        (audit) => audit.editUniqueId !== uniqueId
      );
    },

    async uploadAuditFile(uniqueId: string, file: File) {
      const formData = new FormData();
      // To handle non-ascii characters, we encode the filename here and decode it on the back
      formData.set("file", file, encodeURI(file.name));

      this.increaseCurrentRequestCount();

      try {
        const notesFile: NotesFile = await api.post(`/api/audits/${uniqueId}/notes/files`, {
          body: formData
        }).json();

        this.updateCurrentAuditEditionDate();

        const notesFiles = this.entities[uniqueId].notesFiles || [];
        notesFiles.unshift(notesFile);
        return notesFile;
      } finally {
        this.decreaseCurrentRequestCount();
      }
    },

    async deleteAuditFile(uniqueId: string, fileId: number) {
      this.increaseCurrentRequestCount();
      await api
        .delete(`/api/audits/${uniqueId}/notes/files/${fileId}`)
        .then(() => {
          this.updateCurrentAuditEditionDate();
        })
        .finally(() => {
          this.decreaseCurrentRequestCount();
        });

      const notesFiles = this.entities[uniqueId].notesFiles || [];
      const fileIndex = notesFiles.findIndex((f) => f.id === fileId);

      notesFiles.splice(fileIndex, 1);
    },

    async publishAudit(uniqueId: string): Promise<Audit> {
      const response = (await api
        .put(`/api/audits/${uniqueId}/publish`)
        .json()) as Audit;
      this.setAudit(uniqueId, response);
      return response;
    },

    async toggleAuditPrivacy(uniqueId: string) {
      const currentIsPublicValue = this.currentAudit?.isPublic;
      await ky
        .patch(`/api/audits/${uniqueId}/privacy`, {
          json: {
            isPublic: !currentIsPublicValue
          }
        })
        .then(() => {
          // Live update UI with correct isPublic value
          if (this.currentAudit) {
            this.currentAudit.isPublic = !currentIsPublicValue;
          }

          const listingEditedAuditIndex = this.listing.findIndex(a => a.editUniqueId === uniqueId);
          if (listingEditedAuditIndex >= 0) {
            this.listing[listingEditedAuditIndex].isPublic = !this.listing[listingEditedAuditIndex].isPublic;
          }
        });
    },

    /**
     * @param uniqueId Id of the audit to duplicate
     * @returns A promise to the unique id of the copy
     */
    async duplicateAudit(uniqueId: string, copyName: string): Promise<string> {
      const newAudit = (await api
        .post(`/api/audits/${uniqueId}/duplicate`, {
          json: {
            procedureName: copyName
          },
          // Duplicating an audit can be a pretty long process
          timeout: false
        })
        .json()) as Audit;

      const originalAuditListingItem = this.listing.find(
        (audit) => audit.editUniqueId === uniqueId
      );

      // If audit is duplicated from the audit list, add a new item to the list
      if (originalAuditListingItem) {
        const newAuditListItem: AccountAudit = {
          auditType: newAudit.auditType,
          complianceLevel: originalAuditListingItem.complianceLevel,
          consultUniqueId: newAudit.consultUniqueId,
          creationDate: newAudit.creationDate!,
          editUniqueId: newAudit.editUniqueId,
          procedureName: newAudit.procedureName,
          status: originalAuditListingItem.status,
          progress: originalAuditListingItem.progress,
          estimatedCsvSize: originalAuditListingItem.estimatedCsvSize,
          statementIsPublished: originalAuditListingItem.statementIsPublished,
          isPublic: false
        };
        this.listing.push(newAuditListItem);
      }

      return newAudit.editUniqueId;
    },

    // FIXME: move this to filter store?
    async updateCurrentPageId(id: number | null) {
      this.currentPageId = id;
    },

    async fetchAudits() {
      const audits = (await api
        .get("/api/audits")
        .json()) as AccountAudit[];

      this.listing = audits;
    },

    async transferAudit(editUniqueId: string, newEmail: string) {
      await api.put(`/api/audits/${editUniqueId}/transfer`, { json: {
        newEmail
      } });

      delete this.entities[editUniqueId];
      this.listing = this.listing.filter(
        (audit) => audit.editUniqueId !== editUniqueId
      );
    },

    increaseCurrentRequestCount() {
      this.currentRequestCount++;
    },

    /**
     * When `currentRequestCount` changes from a non-zero value to zero, save a timestamp to the store and localstorage
     */
    decreaseCurrentRequestCount() {
      this.currentRequestCount--;

      if (this.currentRequestCount === 0) {
        this.lastRequestSuccessEnd = Date.now();
        const key = getLastRequestTimestampStorageKey(this.currentAuditId!);
        localStorage.setItem(key, this.lastRequestSuccessEnd.toString());
      }
    },

    /**
     * Locally update edition date of the current audit It might be
     * slightly different of the one stored in DB but close enough in our case.
     */
    updateCurrentAuditEditionDate() {
      if (this.currentAudit) {
        this.currentAudit.editionDate = new Date().toISOString();
      }
    }
  },
  getters: {
    currentAuditId() {
      const route = router.resolve(window.location.pathname);
      const auditUniqueId = route.params.uniqueId as string | undefined;
      return auditUniqueId;
    },
    currentAudit(state): Audit | null {
      if (!this.currentAuditId) {
        return null;
      }
      return state.entities[this.currentAuditId];
    },

    isLoading(): boolean {
      return this.currentRequestCount > 0;
    }
  }
});
