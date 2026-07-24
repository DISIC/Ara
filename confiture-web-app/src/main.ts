import { createHead } from "@unhead/vue/client";
import { marked, Tokens } from "marked";

import { createPinia } from "pinia";
import { createApp } from "vue";
import App from "./App.vue";
// @ts-expect-error the matomo plugin is a js file without type declarations
import Matomo from "./matomo.js";
import router from "./router";

import { setupSentry } from "./sentry";
import "./styles/main.css";
import "@gouvfr/dsfr/dist/dsfr.min.css";
import "@gouvfr/dsfr/dist/dsfr.module.min.js";
import "@gouvfr/dsfr/dist/utility/icons/icons.css";

// markdown configuration
{
  const extension = {
    useNewRenderer: true,
    renderer: {
      link(token: Tokens.Link) {
        if (token.href?.startsWith("#")) {
          return `<a
            href="https://accessibilite.numerique.gouv.fr/methode/glossaire/${token.href}"
            target="_blank"
            class="no-external-icon"
          >${token.text}<span class="fr-sr-only"> (ouvre dans une nouvelle fenêtre)</span></a>`;
        } else {
          return `<a href="${token.href}">${token.text}</a>`;
        }
      }
    }
  };

  marked.use(extension);
}

const pinia = createPinia();
const head = createHead();

const app = createApp(App);
app.use(router).use(pinia).use(head);

if (import.meta.env.VITE_MATOMO_ENABLE) {
  app.use(Matomo, {
    host: "https://stats.data.gouv.fr",
    siteId: 269,
    router,
    enableLinkTracking: false
  });
}

setupSentry(app, pinia);

app.mount("#app");
