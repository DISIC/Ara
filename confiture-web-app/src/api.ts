import ky from "ky";
import { useAccountStore } from "./store";
import { useNotifications } from "./composables/useNotifications";

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
    ],
    afterResponse: [
      (_req, _options, res) => {
        const backendVersion = res.headers.get("x-ara-version");
        const expectedVersion = import.meta.env.VITE_ARA_VERSION;
        if (backendVersion !== expectedVersion) {
          const notify = useNotifications()
          notify("warning", "Une nouvelle version d’Ara est disponible", "Merci de rafraichir la page.")
        }
      }
    ]
  }
});
