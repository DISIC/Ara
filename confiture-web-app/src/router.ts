import { createRouter, createWebHistory } from "vue-router";

import AccessibilityPage from "./pages/misc/AccessibilityPage.vue";
import AccessibilityPlanPage from "./pages/help/AccessibilityPlanPage.vue";
import AccessibilityStatementPage from "./pages/help/AccessibilityStatementPage.vue";
import AccessibilityTrainingPage from "./pages/resources/AccessibilityTrainingPage.vue";
import AuditPage from "./pages/AuditPage.vue";
import EditAuditStepOnePage from "./pages/edit/EditAuditStepOnePage.vue";
import EditAuditStepTwoPage from "./pages/edit/EditAuditStepTwoPage.vue";
import AuditNotFoundPage from "./pages/error/AuditNotFoundPage.vue";
import NotFoundPage from "./pages/error/NotFoundPage.vue";
import FeedbackPage from "./pages/FeedbackPage.vue";
import GlossaryPage from "./pages/resources/GlossaryPage.vue";
import HelpPage from "./pages/help/HelpPage.vue";
import HomePage from "./pages/HomePage.vue";
import LegalPage from "./pages/misc/LegalPage.vue";
import LegalRequirementsPage from "./pages/help/LegalRequirementsPage.vue";
import NewAuditStepOnePage from "./pages/edit/NewAuditStepOnePage.vue";
import PersonalDataPage from "./pages/misc/PersonalDataPage.vue";
import ReportPage from "./pages/consult/ReportPage.vue";
import ResourcesPage from "./pages/resources/ResourcesPage.vue";
import RGAAPage from "./pages/help/RGAAPage.vue";
import SiteMapPage from "./pages/misc/SiteMapPage.vue";
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
      path: "/rapports/:uniqueId",
      name: "report",
      component: ReportPage,
    },
    // Resources pages
    {
      path: "/ressources",
      name: "resources",
      component: ResourcesPage,
      meta: {
        breadcrumbLinks: [
          { label: "Accueil", name: "home" },
          { label: "Ressources", name: "resources" },
        ],
      },
    },
    {
      path: "/ressources/formations-accessibilite",
      name: "accessibility-training",
      component: AccessibilityTrainingPage,
      meta: {
        breadcrumbLinks: [
          { label: "Accueil", name: "home" },
          { label: "Ressources", name: "resources" },
          { label: "Formations accessibilité", name: "accessibility-training" },
        ],
      },
    },
    {
      path: "/ressources/outils",
      name: "tools",
      component: ToolsPage,
      meta: {
        breadcrumbLinks: [
          { label: "Accueil", name: "home" },
          { label: "Ressources", name: "resources" },
          { label: "Outils", name: "tools" },
        ],
      },
    },
    {
      path: "/ressources/glossaire",
      name: "glossary",
      component: GlossaryPage,
      meta: {
        breadcrumbLinks: [
          { label: "Accueil", name: "home" },
          { label: "Ressources", name: "resources" },
          { label: "Glossaire RGAA", name: "glossary" },
        ],
      },
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
      meta: {
        breadcrumbLinks: [
          { label: "Accueil", name: "home" },
          { label: "Aide", name: "help" },
          { label: "Obligations légales", name: "legal-requirements" },
        ],
      },
    },
    {
      path: "/aide/rgaa",
      name: "rgaa",
      component: RGAAPage,
      meta: {
        breadcrumbLinks: [
          { label: "Accueil", name: "home" },
          { label: "Aide", name: "help" },
          { label: "RGAA", name: "rgaa" },
        ],
      },
    },
    {
      path: "/aide/declaration-accessibilite",
      name: "accessibility-statement",
      component: AccessibilityStatementPage,
      meta: {
        breadcrumbLinks: [
          { label: "Accueil", name: "home" },
          { label: "Aide", name: "help" },
          {
            label: "Déclaration d’accessibilité",
            name: "accessibility-statement",
          },
        ],
      },
    },
    {
      path: "/aide/schema-pluriannuel",
      name: "accessibility-plan",
      component: AccessibilityPlanPage,
      meta: {
        breadcrumbLinks: [
          { label: "Accueil", name: "home" },
          { label: "Aide", name: "help" },
          { label: "Schéma pluriannuel", name: "accessibility-plan" },
        ],
      },
    },
    // Feedback page
    {
      path: "/donner-mon-avis",
      name: "feedback",
      component: FeedbackPage,
      meta: {
        breadcrumbLinks: [
          { label: "Accueil", name: "home" },
          { label: "Donner mon avis", name: "feedback" },
        ],
      },
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
  scrollBehavior(to) {
    if (to.hash) {
      return { el: to.hash };
    }
    return { top: 0 };
  },
});

export default router;
