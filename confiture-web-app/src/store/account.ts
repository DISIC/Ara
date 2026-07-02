import jwtDecode from "jwt-decode";
import { defineStore } from "pinia";
import { api } from "../api";

import { AuthenticationJwtPayload } from "../types";
import {
  AccountDeletionResponse,
  UpdateProfileRequestData
} from "../types/account";

const AUTH_TOKEN_STORAGE_KEY = "confiture:authToken";

export interface AccountStoreState {
  authToken: null | string;
  accountDeletionFeedbackToken: null | string;
}

export const useAccountStore = defineStore("account", {
  state: (): AccountStoreState => {
    let authToken = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) ?? null;

    if (authToken) {
      try {
        const payload = jwtDecode(authToken) as AuthenticationJwtPayload;

        const isTokenExpired = payload.exp * 1000 < Date.now();
        if (isTokenExpired) {
          throw "tokenIsExpired";
        }
      } catch {
        authToken = null;
        localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
      }
    }

    return {
      authToken: authToken,
      accountDeletionFeedbackToken: null
    };
  },

  getters: {
    account: (state) => {
      if (!state.authToken) {
        return null;
      }
      const payload = jwtDecode(state.authToken) as AuthenticationJwtPayload;
      return {
        uid: payload.sub,
        email: payload.email,
        name: payload.name
      };
    }
  },

  actions: {
    async createAccount(username: string, password: string) {
      await api.post("/api/auth/signup", {
        json: {
          username,
          password
        }
      });
    },

    async resendVerificationEmail(username: string) {
      await api.post("/api/auth/resend-verification-email", {
        json: {
          username
        }
      });
    },

    async login(username: string, password: string) {
      const authToken = await api
        .post("/api/auth/signin", {
          json: {
            username,
            password
          }
        })
        .text();

      this.authToken = authToken;
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, authToken);
    },

    async refreshToken() {
      const authToken = await api
        .post("/api/auth/refresh")
        .text();

      this.authToken = authToken;
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, authToken);
    },

    logout() {
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
      this.$reset();
    },

    async verifyAccountCreation(verificationToken: string) {
      await api.post("/api/auth/verify", {
        json: {
          token: verificationToken
        }
      });
    },

    waitForVerification(username: string, signal: AbortSignal) {
      const CHECK_INTERVAL = 5000;
      const url = `/api/auth/verified?username=${encodeURIComponent(username)}`;

      return new Promise<void>((resolve, reject) => {
        let isAborted = false;
        let timerId: undefined | ReturnType<typeof setTimeout> = undefined;

        const onAbort = () => {
          isAborted = true;
          clearTimeout(timerId);
          reject();
        };

        signal.addEventListener("abort", onAbort, { once: true });

        const checkIsVerified = async () => {
          const isAccountVerified = await api.get(url).json();

          if (!isAccountVerified && !isAborted) {
            timerId = setTimeout(checkIsVerified, CHECK_INTERVAL);
          } else {
            signal.removeEventListener("abort", onAbort);
            resolve();
          }
        };

        timerId = setTimeout(checkIsVerified, CHECK_INTERVAL);
      });
    },

    async updateProfile(data: UpdateProfileRequestData) {
      await api
        .patch(`/api/profile`, {
          json: data
        })
        .json();

      await this.refreshToken();
    },

    async deleteAccount(password: string) {
      const response = (await api
        .delete("/api/auth/account", {
          json: {
            password
          }
        })
        .json()) as AccountDeletionResponse;

      this.logout();
      this.accountDeletionFeedbackToken = response.feedbackToken;
    },

    async sendAccountDeletionFeedback(feedback: string) {
      await api.post("/api/feedback/account-deleted", {
        json: {
          feedback,
          feedbackToken: this.accountDeletionFeedbackToken
        }
      });
    },

    async updateEmail(newEmail: string, password: string) {
      await api.put("/api/auth/account/email", {
        json: {
          newEmail,
          password
        }
      });
    },

    async resendEmailUpdateVerificationEmail() {
      await api.post(
        "/api/auth/account/resend-email-update-verification-email"
      );
    },

    async cancelEmailUpdate() {
      await api.post("/api/auth/account/cancel-email-update");
    },

    async verifyEmailUpdate(verificationToken: string) {
      await api.post("/api/auth/account/verify-email-update", {
        json: {
          token: verificationToken
        }
      });
    },

    async updatePassword(oldPassword: string, newPassword: string) {
      await api.put("/api/auth/update-password", {
        json: { oldPassword, newPassword }
      });
    },

    waitForEmailUpdateVerification(newEmail: string, signal: AbortSignal) {
      const CHECK_INTERVAL = 5000;
      const url = `/api/auth/account/verified-email-update?email=${encodeURIComponent(
        newEmail
      )}`;

      return new Promise<void>((resolve, reject) => {
        let isAborted = false;
        let timerId: undefined | ReturnType<typeof setTimeout> = undefined;

        const onAbort = () => {
          isAborted = true;
          clearTimeout(timerId);
          reject();
        };

        signal.addEventListener("abort", onAbort, { once: true });

        const checkIsVerified = async () => {
          const isAccountVerified = await api
            .get(url)
            .json();

          if (!isAccountVerified && !isAborted) {
            timerId = setTimeout(checkIsVerified, CHECK_INTERVAL);
          } else {
            signal.removeEventListener("abort", onAbort);
            resolve();
          }
        };

        timerId = setTimeout(checkIsVerified, CHECK_INTERVAL);
      });
    },

    async requestPasswordReset(email: string) {
      await api.post("/api/auth/account/request-password-reset", {
        json: { email }
      });
    },

    async resetPassword(newPassword: string, verificationToken: string) {
      await api.post("/api/auth/account/reset-password", {
        json: { newPassword, token: verificationToken }
      });
    }
  }
});
