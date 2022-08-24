import { createApp } from "vue";
import { createPinia } from "pinia";
import { marked } from "marked";

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
      return `<a href="/ressources/glossaire${href}" target="_blank">${text}</a>`;
    },
  };

  marked.use({ renderer });
}

const pinia = createPinia();

createApp(App).use(router).use(pinia).mount("#app");
