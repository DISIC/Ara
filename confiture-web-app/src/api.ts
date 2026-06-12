import ky from "ky";
import { useAccountStore } from "./store";

export const api = ky.extend({
  hooks: {
    beforeRequest: [
      ({ headers }) => {
        // authenticate user with API if they are logged in
        const accountStore = useAccountStore();
        if (accountStore.authToken) {
          headers.set("Authorization", `Bearer ${accountStore.authToken}`);
        }
      }
    ]
  }
});
