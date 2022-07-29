import { createApp } from "vue";
import App from "./App.vue";

import "./styles/main.css";
import "@gouvfr/dsfr/dist/dsfr.min.css";
import "@gouvfr/dsfr/dist/dsfr.module.min.js";
import "@gouvfr/dsfr/dist/utility/icons/icons.css";

import router from "./router";

createApp(App).use(router).mount("#app");
