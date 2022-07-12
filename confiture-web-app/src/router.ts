import { createRouter, createWebHistory } from "vue-router";

import HomePage from "./pages/HomePage.vue";
import NotFoundPage from "./pages/NotFoundPage.vue";
import AuditPage from "./pages/AuditPage.vue";

const router = createRouter({
  routes: [
    {
      path: "/",
      name: "home",
      component: HomePage,
    },
    {
      path: "/audits/:uniqueId",
      name: "audit",
      component: AuditPage,
    },
    {
      path: "/:pathMatch(.*)*",
      name: "NotFound",
      component: NotFoundPage,
    },
  ],
  history: createWebHistory(),
});

export default router;
