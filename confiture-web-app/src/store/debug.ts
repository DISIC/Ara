import { defineStore } from "pinia";
import { api } from "../api";
import { Audit, CreateDebugAuditRequestData } from "../types";

const lsAllowDevModeKey = "ara:allow-dev-mode";
const lsDevModeKey = "ara:dev-mode";

export const useDebugStore = defineStore("debug", {

  state: () => {
    return {
      allowDevMode: false,
      devMode: false
    };
  },
  actions: {
    async initDevModeSwitch() {
      const allowDevModeFromLS = localStorage.getItem(lsAllowDevModeKey);
      let allowDevMode: boolean;
      if (allowDevModeFromLS === "true" || allowDevModeFromLS === "false") {
        // check if dev mode is allowed from local storage "ara:allow-dev-mode" key
        allowDevMode = (allowDevModeFromLS === "true");
      } else {
        // check if server allows dev mode
        allowDevMode = await api.get("/api/debug/is-dev-mode-allowed").json() as boolean;
      }
      this.allowDevMode = allowDevMode;

      const devModeFromLS = localStorage.getItem(lsDevModeKey);
      if (!allowDevMode) {
        // dev mode deactivated if dev mode is not allowed
        this.devMode = false;
      } else if (devModeFromLS === "true" || devModeFromLS === "false") {
        // set dev mode from local storage "ara:dev-mode" key value
        this.devMode = (devModeFromLS === "true");
      } else {
        // By default, if dev mode is allowed, dev mode is activated
        this.devMode = true;
      }
    },
    saveDevMode(devMode: boolean) {
      this.devMode = devMode;
      localStorage.setItem(lsDevModeKey, devMode ? "true" : "false");
    },
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
