import ky from "ky";
import { defineStore } from "pinia";

interface AccountStoreState {
  account: null | {
    email: string;
  };
  authToken: null | string;
}

export const useAccountStore = defineStore("account", {
  state: (): AccountStoreState => ({
    account: null,
    authToken: null,
  }),

  actions: {
    async createAccount(username: string, password: string) {
      await ky.post("/api/auth/signup", {
        json: {
          username,
          password,
        },
      });
    },

    async resendVerificationEmail(username: string) {
      await ky.post("/api/auth/resend-verification-email", {
        json: {
          username,
        },
      });
    },
  },
});
