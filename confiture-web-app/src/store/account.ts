import ky from "ky";
import { defineStore } from "pinia";
import jwtDecode from "jwt-decode";
import { AuthenticationJwtPayload } from "../types";

const AUTH_TOKEN_STORAGE_KEY = "confiture:authToken";

interface AccountStoreState {
  account: null | {
    email: string;
  };
  authToken: null | string;
}

export const useAccountStore = defineStore("account", {
  state: (): AccountStoreState => {
    let authToken =
      sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY) ??
      localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) ??
      null;

    let email: string | null = null;
    if (authToken) {
      const payload = jwtDecode(authToken) as AuthenticationJwtPayload;

      const isTokenExpired = payload.exp * 1000 < Date.now();

      if (isTokenExpired) {
        authToken = null;
        localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
        sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
      } else {
        email = payload.email;
      }
    }

    return {
      account: email ? { email } : null,
      authToken: authToken,
    };
  },

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

    /**
     * @param rememberMe If true, the authentication token is stored in the localstorage instead of the sessionstorage
     */
    async login(username: string, password: string, rememberMe: boolean) {
      const authToken = await ky
        .post("/api/auth/signin", {
          json: {
            username,
            password,
          },
        })
        .text();

      this.account = {
        email: username,
      };
      this.authToken = authToken;

      if (rememberMe) {
        localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, authToken);
        sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
      } else {
        sessionStorage.setItem(AUTH_TOKEN_STORAGE_KEY, authToken);
        localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
      }
    },

    logout() {
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
      sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
      this.$reset();
    },

    async verifyAccountCreation(verificationToken: string) {
      await ky.post("/api/auth/verify", {
        json: {
          token: verificationToken,
        },
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
          const isAccountVerified = await ky.get(url).json();

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
  },
});
