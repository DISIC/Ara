import { createRouter, createWebHistory } from "vue-router";

import AccessibilityPage from "./pages/AccessibilityPage.vue";
import AccessibilityPlanPage from "./pages/AccessibilityPlanPage.vue";
import AccessibilityStatementPage from "./pages/AccessibilityStatementPage.vue";
import AccessibilityTrainingPage from "./pages/AccessibilityTrainingPage.vue";
import AuditPage from "./pages/AuditPage.vue";
import EditAuditStepOnePage from "./pages/EditAuditStepOnePage.vue";
import EditAuditStepTwoPage from "./pages/EditAuditStepTwoPage.vue";
import AuditNotFoundPage from "./pages/error/AuditNotFoundPage.vue";
import NotFoundPage from "./pages/error/NotFoundPage.vue";
import FeedbackPage from "./pages/FeedbackPage.vue";
import GlossaryPage from "./pages/GlossaryPage.vue";
import HelpPage from "./pages/HelpPage.vue";
import HomePage from "./pages/HomePage.vue";
import LegalPage from "./pages/LegalPage.vue";
import LegalRequirementsPage from "./pages/LegalRequirementsPage.vue";
import NewAuditStepOnePage from "./pages/NewAuditStepOnePage.vue";
import PersonalDataPage from "./pages/PersonalDataPage.vue";
import ReportPage from "./pages/ReportPage.vue";
import ResourcesPage from "./pages/ResourcesPage.vue";
import RGAAPage from "./pages/RGAAPage.vue";
import SiteMapPage from "./pages/SiteMapPage.vue";
import ToolsPage from "./pages/ToolsPage.vue";

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
      name: "new-audit-step-one",
      component: NewAuditStepOnePage,
    },
    {
      path: "/audits/:uniqueId/informations-generales",
      name: "edit-audit-step-one",
      component: EditAuditStepOnePage,
    },
    {
      path: "/audits/:uniqueId/parametres",
      name: "edit-audit-step-two",
      component: EditAuditStepTwoPage,
    },
    {
      path: "/audits/:uniqueId",
      name: "audit",
      component: AuditPage,
    },
    {
      path: "/rapports/:uniqueId",
      name: "report",
      component: ReportPage,
    },
    // Resources pages
    {
      path: "/ressources",
      name: "resources",
      component: ResourcesPage,
    },
    {
      path: "/ressources/formations-accessibilite",
      name: "accessibility-training",
      component: AccessibilityTrainingPage,
    },
    {
      path: "/ressources/outils",
      name: "tools",
      component: ToolsPage,
    },
    {
      path: "/ressources/glossaire",
      name: "glossary",
      component: GlossaryPage,
    },
    // Help pages
    {
      path: "/aide",
      name: "help",
      component: HelpPage,
    },
    {
      path: "/aide/obligations-legales",
      name: "legal-requirements",
      component: LegalRequirementsPage,
    },
    {
      path: "/aide/rgaa",
      name: "rgaa",
      component: RGAAPage,
    },
    {
      path: "/aide/declaration-accessibilite",
      name: "accessibility-statement",
      component: AccessibilityStatementPage,
    },
    {
      path: "/aide/schema-pluriannuel",
      name: "accessibility-plan",
      component: AccessibilityPlanPage,
    },
    // Feedback page
    {
      path: "/donner-mon-avis",
      name: "feedback",
      component: FeedbackPage,
    },
    // Error pages
    {
      path: "/:pathMatch(.*)*",
      name: "NotFound",
      component: NotFoundPage,
    },
    {
      path: "/:pathMatch(.*)*",
      name: "AuditNotFound",
      component: AuditNotFoundPage,
    },
  ],
  history: createWebHistory(),
  scrollBehavior() {
    return { top: 0 };
  },
});

export default router;
