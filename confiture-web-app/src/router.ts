import { createRouter, createWebHistory } from "vue-router";

import HomePage from "./pages/HomePage.vue";
import SiteMapPage from "./pages/SiteMapPage.vue";
import AccessibilityPage from "./pages/AccessibilityPage.vue";
import LegalPage from "./pages/LegalPage.vue";
import PersonalDataPage from "./pages/PersonalDataPage.vue";
import NotFoundPage from "./pages/NotFoundPage.vue";
import NewAuditPage from "./pages/NewAuditPage.vue";
import AuditPage from "./pages/AuditPage.vue";
import HelpPage from "./pages/HelpPage.vue";

const router = createRouter({
  routes: [
    // Base pages
    {
      path: "/",
      name: "home",
      component: HomePage,
    },
    {
      path: "/plan-du-site",
      name: "site-map",
      component: SiteMapPage,
    },
    {
      path: "/accessibilite",
      name: "accessibility",
      component: AccessibilityPage,
    },
    {
      path: "/mentions-legales",
      name: "legal",
      component: LegalPage,
    },
    {
      path: "/donnees-personnelles",
      name: "personal-data",
      component: PersonalDataPage,
    },
    // Audit pages
    {
      path: "/audits/nouveau",
      name: "new-audit",
      component: NewAuditPage,
    },
    {
      path: "/audits/:uniqueId",
      name: "audit",
      component: AuditPage,
    },
    // Help pages
    {
      path: "/aide",
      name: "help",
      component: HelpPage,
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
