import { defineStore } from "pinia";
import { api } from "../api";
import { Audit, CreateDebugAuditRequestData } from "../types";

export const useDebugStore = defineStore("debug", {
  actions: {
    async createDebugAudit(data: CreateDebugAuditRequestData) {
      const response = (await api
        .post("/api/debug/create-audit", {
          json: data
        })
        .json()) as Audit;
      return response;
    }
  }
});
