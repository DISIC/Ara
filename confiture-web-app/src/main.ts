import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";

import "./styles/main.css";
import "@gouvfr/dsfr/dist/dsfr.min.css";
import "@gouvfr/dsfr/dist/dsfr.module.min.js";
import "@gouvfr/dsfr/dist/utility/icons/icons.css";

import router from "./router";

const pinia = createPinia();

createApp(App).use(router).use(pinia).mount("#app");
