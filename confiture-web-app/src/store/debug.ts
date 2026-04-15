import ky from "ky";
import { defineStore } from "pinia";
import { useDevMode } from "../composables/useDevMode";
import { Audit, CreateDebugAuditRequestData } from "../types";

const isDevMode = useDevMode();
const isProductionEnv = import.meta.env.PROD;
const isHeroku = window.location.hostname.endsWith(".herokuapp.com");

// True on dev and review environments with "?dev=1"
export const ENABLE_DEBUG_CARD = isDevMode && (!isProductionEnv || (isProductionEnv && isHeroku));

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
