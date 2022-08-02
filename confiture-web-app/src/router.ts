import { createRouter, createWebHistory } from "vue-router";

import ContextPage from "./pages/consult/ContextPage.vue";
import ReportPage from "./pages/consult/ReportPage.vue";
import EditAuditStepOnePage from "./pages/edit/EditAuditStepOnePage.vue";
import EditAuditStepThreePage from "./pages/edit/EditAuditStepThreePage.vue";
import EditAuditStepTwoPage from "./pages/edit/EditAuditStepTwoPage.vue";
import NewAuditStepOnePage from "./pages/edit/NewAuditStepOnePage.vue";
import AuditNotFoundPage from "./pages/error/AuditNotFoundPage.vue";
import NotFoundPage from "./pages/error/NotFoundPage.vue";
import ServerErrorPage from "./pages/error/ServerErrorPage.vue";
import ServiceUnavailablePage from "./pages/error/ServiceUnavailablePage.vue";
import FeedbackPage from "./pages/FeedbackPage.vue";
import AccessibilityPlanPage from "./pages/help/AccessibilityPlanPage.vue";
import AccessibilityStatementPage from "./pages/help/AccessibilityStatementPage.vue";
import HelpPage from "./pages/help/HelpPage.vue";
import LegalRequirementsPage from "./pages/help/LegalRequirementsPage.vue";
import RGAAPage from "./pages/help/RGAAPage.vue";
import HomePage from "./pages/HomePage.vue";
import AccessibilityPage from "./pages/misc/AccessibilityPage.vue";
import LegalPage from "./pages/misc/LegalPage.vue";
import PersonalDataPage from "./pages/misc/PersonalDataPage.vue";
import SiteMapPage from "./pages/misc/SiteMapPage.vue";
import AccessibilityTrainingPage from "./pages/resources/AccessibilityTrainingPage.vue";
import GlossaryPage from "./pages/resources/GlossaryPage.vue";
import ResourcesPage from "./pages/resources/ResourcesPage.vue";
import ToolsPage from "./pages/resources/ToolsPage.vue";

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
      path: "/audits/:uniqueId/generation",
      name: "edit-audit-step-three",
      component: EditAuditStepThreePage,
    },
    {
      path: "/rapports/:uniqueId",
      name: "report",
      component: ReportPage,
    },
    {
      path: "/rapports/:uniqueId/contexte",
      name: "context",
      component: ContextPage,
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
    // TODO: fake error pages for dev purpose, to remove.
    {
      path: "/404",
      name: "PageNotFoundDev",
      component: NotFoundPage,
    },
    {
      path: "/410",
      name: "AuditNotFoundDev",
      component: AuditNotFoundPage,
    },
    {
      path: "/500",
      name: "ServerErrorDev",
      component: ServerErrorPage,
    },
    {
      path: "/503",
      name: "ServiceUnavailableDev",
      component: ServiceUnavailablePage,
    },
  ],
  history: createWebHistory(),
  scrollBehavior(to) {
    if (to.hash) {
      return { el: to.hash };
    }
    return { top: 0 };
  },
});

export default router;
