import ky from "ky";
import { defineStore } from "pinia";
import { Audit, CreateDebugAuditRequestData } from "../types";

export const useDebugStore = defineStore("debug", {
  actions: {
    async createDebugAudit(data: CreateDebugAuditRequestData) {
      const response = (await ky
        .post("/api/debug/create-audit", {
          json: data
        })
        .json()) as Audit;
      return response;
    }
  }
});
