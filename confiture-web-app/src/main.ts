import { createApp } from "vue";
import { createPinia } from "pinia";
import { marked } from "marked";
import { createHead } from "@vueuse/head";
// @ts-expect-error vue-matomo does not have any sort of typescript support :'(
import Matomo from "vue-matomo";

import * as Sentry from "@sentry/vue";
import { BrowserTracing } from "@sentry/tracing";

import App from "./App.vue";

import "./styles/main.css";
import "@gouvfr/dsfr/dist/dsfr.min.css";
import "@gouvfr/dsfr/dist/dsfr.module.min.js";
import "@gouvfr/dsfr/dist/utility/icons/icons.css";

import router from "./router";

// markdown configuration
{
  // TODO: use a <RouterLink />
  const renderer = {
    link(href: string, title: string, text: string) {
      if (href.startsWith("#")) {
        return `<a href="/ressources/glossaire${href}">${text}</a>`;
      } else {
        return `<a href="${href}">${text}</a>`;
      }
    },
  };

  marked.use({ renderer });
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
  });
}

// setup Sentry error logging
if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    app,
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [
      new BrowserTracing({
        routingInstrumentation: Sentry.vueRouterInstrumentation(router),
        tracePropagationTargets: [window.location.hostname, /^\//],
      }),
      new Sentry.Replay({
        // anonymization settings
        maskAllText: true,
        maskAllInputs: true,
        blockAllMedia: true,
      }),
    ],

    // Set to a value between 0 and 1.0 to enable performance monitoring
    // 0.5 means half the events will be transferred
    tracesSampleRate: 0,

    // When an error happen save a replay of what happened similar to birdeatsbug
    // See https://docs.sentry.io/platforms/javascript/guides/react/session-replay/#replay-captures-on-errors-only
    replaysOnErrorSampleRate:
      import.meta.env.VITE_SENTRY_ENVIRONMENT === "production" ? 1 : 0,

    /*
      Differentiate between the various environments of the app
      example values :
      - "local" : Local development
      - "preview" : Pre-production application
      - "production" : Production application
    */
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT ?? "unknown",

    release: import.meta.env.VITE_SENTRY_RELEASE,
  });
}

app.mount("#app");
