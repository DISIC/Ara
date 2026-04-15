import ky from "ky";
import { defineStore } from "pinia";
import { Audit, CreateDebugAuditRequestData } from "../types";

// True on dev and review environments with "?dev=1"
// TODO: only check we're in ?dev=1
// because api route are disabled in production anyway

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
