import type { Pinia } from "pinia";
import type { App } from "vue";
import * as Sentry from "@sentry/vue";
import router from "./router";

/** setup Sentry error logging */
export function setupSentry(app: App, pinia: Pinia) {
  if (!import.meta.env.VITE_SENTRY_DSN) {
    return;
  }

  Sentry.init({
    app,
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [
      Sentry.browserTracingIntegration({ router }),
      Sentry.replayIntegration({
        // anonymization settings
        maskAllText: true,
        maskAllInputs: true,
        blockAllMedia: true
      })
    ],
    tracePropagationTargets: [window.location.hostname],

    // Set to a value between 0 and 1.0 to enable performance monitoring
    // 0.5 means half the events will be transferred
    tracesSampleRate: 0,

    // When an error happen save a replay of what happened similar to birdeatsbug
    // See https://docs.sentry.io/platforms/javascript/guides/react/session-replay/#replay-captures-on-errors-only
    replaysOnErrorSampleRate:
      import.meta.env.VITE_SENTRY_ENVIRONMENT === "production" ? 1 : 0,

    /*
      Differentiate between the various environments of the app
      example values:
      - "local": Local development
      - "preview": Pre-production application
      - "production": Production application
    */
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT ?? "unknown",

    release: import.meta.env.VITE_SENTRY_RELEASE
  });

  // integration with pinia stores
  pinia.use(Sentry.createSentryPiniaPlugin({
    stateTransformer(state) {
      // default type is Record<string, unknown> which makes TS very angry :<
      const transformedState = structuredClone(state) as Record<string, any>;

      // remove authentication token from pinia payload
      if (transformedState.account.authToken) {
        transformedState.account.authToken = null;
      }
      return transformedState;
    }
  }));
}
