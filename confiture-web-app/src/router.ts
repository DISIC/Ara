import { createRouter, createWebHistory } from "vue-router";

import ContextPage from "./pages/consult/ContextPage.vue";
import ReportPage from "./pages/consult/ReportPage.vue";
import EditAuditStepOnePage from "./pages/edit/EditAuditStepOnePage.vue";
import EditAuditStepTwoPage from "./pages/edit/EditAuditStepTwoPage.vue";
import EditAuditStepThreePage from "./pages/edit/EditAuditStepThreePage.vue";
import EditAuditStepFourPage from "./pages/edit/EditAuditStepFourPage.vue";
import NewAuditStepOnePage from "./pages/edit/NewAuditStepOnePage.vue";
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
import ErrorPage from "./pages/error/ErrorPage.vue";

declare module "vue-router" {
  interface RouteMeta {
    // add a `meta.name` property to have the route's name appear in "go back to [name]" prompts
    name: string;
  }
}

export const history = createWebHistory();

const router = createRouter({
  routes: [
    // Base pages
    {
      path: "/",
      name: "home",
      component: HomePage,
      meta: {
        name: "Accueil",
      },
    },
    {
      path: "/plan-du-site",
      name: "site-map",
      component: SiteMapPage,
      meta: {
        name: "Plan du site",
        breadcrumbLinks: [
          { label: "Accueil", name: "home" },
          { label: "Plan du site", name: "site-map" },
        ],
      },
    },
    {
      path: "/accessibilite",
      name: "accessibility",
      component: AccessibilityPage,
      meta: {
        name: "Accessibilité",
        breadcrumbLinks: [
          { label: "Accueil", name: "home" },
          { label: "Accessibilité", name: "accessibility" },
        ],
      },
    },
    {
      path: "/mentions-legales",
      name: "legal",
      component: LegalPage,
      meta: {
        name: "Mentions légales",
        breadcrumbLinks: [
          { label: "Accueil", name: "home" },
          { label: "Mentions légales", name: "legal" },
        ],
      },
    },
    {
      path: "/donnees-personnelles",
      name: "personal-data",
      component: PersonalDataPage,
      meta: {
        name: "Données personnelles",
        breadcrumbLinks: [
          { label: "Accueil", name: "home" },
          { label: "Données personnelles", name: "personal-data" },
        ],
      },
    },
    // Audit pages
    {
      path: "/audits/nouveau",
      name: "new-audit-step-one",
      component: NewAuditStepOnePage,
      meta: {
        name: "Nouvel audit",
        breadcrumbLinks: [
          { label: "Accueil", name: "home" },
          { label: "Nouvel audit", name: "new-audit-step-one" },
        ],
      },
    },
    {
      path: "/audits/:uniqueId/informations-generales",
      name: "edit-audit-step-one",
      component: EditAuditStepOnePage,
      meta: {
        name: "Mon audit",
        breadcrumbLinks: [
          { label: "Accueil", name: "home" },
          { label: "Mon audit", name: "edit-audit-step-one" },
        ],
      },
    },
    {
      path: "/audits/:uniqueId/parametres",
      name: "edit-audit-step-two",
      component: EditAuditStepTwoPage,
      meta: {
        name: "Mon audit",
        breadcrumbLinks: [
          { label: "Accueil", name: "home" },
          { label: "Mon audit", name: "edit-audit-step-two" },
        ],
      },
    },
    {
      path: "/audits/:uniqueId/generation",
      name: "edit-audit-step-three",
      component: EditAuditStepThreePage,
      meta: {
        name: "Mon audit",
        breadcrumbLinks: [
          { label: "Accueil", name: "home" },
          { label: "Mon audit", name: "edit-audit-step-three" },
        ],
      },
    },
    {
      path: "/audits/:uniqueId/partage",
      name: "edit-audit-step-four",
      component: EditAuditStepFourPage,
      meta: {
        name: "Mon audit",
        breadcrumbLinks: [
          { label: "Accueil", name: "home" },
          { label: "Mon audit", name: "edit-audit-step-four" },
        ],
      },
    },
    // Report pages
    {
      path: "/rapports/:uniqueId",
      name: "report",
      component: ReportPage,
    },
    {
      path: "/rapports/:uniqueId/contexte",
      name: "context",
      component: ContextPage,
      meta: {
        name: "Contexte",
        // breadcrumbLinks: (smth) => {
        //   console.log(smth);
        //   return [
        //     { label: "Rapport d’audit", name: "report" },
        //     { label: "Contexte", name: "context" },
        //   ];
        // },
      },
    },
    // Resources pages
    {
      path: "/ressources",
      name: "resources",
      component: ResourcesPage,
      meta: {
        name: "Ressources",
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
        name: "Formations accessibilité",
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
        name: "Outils",
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
        name: "Glossaire",
        breadcrumbLinks: [
          { label: "Accueil", name: "home" },
          { label: "Ressources", name: "resources" },
          { label: "Glossaire", name: "glossary" },
        ],
      },
    },
    // Help pages
    {
      path: "/aide",
      name: "help",
      component: HelpPage,
      meta: {
        name: "Formations accessibilité",
        breadcrumbLinks: [
          { label: "Accueil", name: "home" },
          { label: "Aide", name: "help" },
        ],
      },
    },
    {
      path: "/aide/obligations-legales",
      name: "legal-requirements",
      component: LegalRequirementsPage,
      meta: {
        name: "Obligations légales et sanctions",
        breadcrumbLinks: [
          { label: "Accueil", name: "home" },
          { label: "Aide", name: "help" },
          {
            label: "Obligations légales et sanctions",
            name: "legal-requirements",
          },
        ],
      },
    },
    {
      path: "/aide/rgaa",
      name: "rgaa",
      component: RGAAPage,
      meta: {
        name: "RGAA",
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
        name: "Déclaration d’accessibilité",
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
        name: "Schéma pluriannuel",
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
        name: "Donner mon avis",
        breadcrumbLinks: [
          { label: "Accueil", name: "home" },
          { label: "Donner mon avis", name: "feedback" },
        ],
      },
    },
    // Error pages
    {
      path: "/:pathMatch(.*)*",
      name: "Error",
      component: ErrorPage,
    },
  ],
  history,
  scrollBehavior(to) {
    if (to.hash) {
      return { el: to.hash };
    }
    return { top: 0 };
  },
});

export default router;
