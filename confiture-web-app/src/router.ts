import { createRouter, createWebHistory, RouteLocation } from "vue-router";

import ContextPage from "./pages/consult/ContextPage.vue";
import ReportPage from "./pages/consult/ReportPage.vue";
import EditAuditStepOnePage from "./pages/edit/EditAuditStepOnePage.vue";
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
import PrivacyPage from "./pages/misc/PrivacyPage.vue";
import SiteMapPage from "./pages/misc/SiteMapPage.vue";
import ContactPage from "./pages/misc/ContactPage.vue";
import AccessibilityTrainingPage from "./pages/resources/AccessibilityTrainingPage.vue";
import A11yIntroTrainingPage from "./pages/resources/A11yIntroTrainingPage.vue";
import PublicDigitalTrainingPage from "./pages/resources/PublicDigitalTrainingPage.vue";
import GlossaryPage from "./pages/resources/GlossaryPage.vue";
import ResourcesPage from "./pages/resources/ResourcesPage.vue";
import MakeA11yAuditPage from "./pages/resources/MakeA11yAuditPage.vue";
import ToolsPage from "./pages/resources/ToolsPage.vue";
import ErrorPage from "./pages/error/ErrorPage.vue";
import EditAuditDeclarationPage from "./pages/edit/EditAuditDeclarationPage.vue";
import RoadmapPage from "./pages/RoadmapPage.vue";
import ChangelogPage from "./pages/ChangelogPage.vue";

import { useAuditStore } from "./store";
import NewAccountPage from "./pages/account/NewAccountPage.vue";
import LoginPage from "./pages/account/LoginPage.vue";
import AccountDashboardPage from "./pages/account/AccountDashboardPage.vue";
import AccountSettingsPage from "./pages/account/AccountSettingsPage.vue";
import NewAccountValidationPage from "./pages/account/NewAccountValidationPage.vue";
import AccountDeletionFeedback from "./pages/account/AccountDeletionFeedback.vue";
import { useAccountStore } from "./store/account";

declare module "vue-router" {
  interface RouteMeta {
    // add a `meta.name` property to have the route's name appear in "go back to [name]" prompts
    name: string;
    breadcrumbLinks?:
      | Array<{ label: string; name: string }>
      | (() => Array<{ label: string; name: string }>);
    hideHomeLink?: boolean;
  }
}

export const history = createWebHistory();

/**
 * Fetch the audit name from store to display in breadcrumb.
 */
function getProcedureName() {
  const auditStore = useAuditStore();
  return auditStore.data?.procedureName ?? "Mon audit";
}

/**
 * Get the home link as first one
 */
function getHomeBreadcrumbLink() {
  return { label: "Accueil", name: "home" };
}

/**
 * When entering an "edit page", store the current page url to use in the header menu.
 */
function saveCurrentEditionStep(to: RouteLocation) {
  const auditStore = useAuditStore();
  auditStore.lastVisitedStepLocation = to.fullPath;
  return true;
}

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
        breadcrumbLinks: () => [
          getHomeBreadcrumbLink(),
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
        breadcrumbLinks: () => [
          getHomeBreadcrumbLink(),
          { label: "Accessibilité", name: "accessibility" },
        ],
      },
    },
    {
      path: "/donnees-personnelles",
      name: "privacy",
      component: PrivacyPage,
      meta: {
        name: "Données personnelles",
        breadcrumbLinks: () => [
          getHomeBreadcrumbLink(),
          { label: "Données personnelles", name: "privacy" },
        ],
      },
    },
    {
      path: "/mentions-legales",
      name: "legal",
      component: LegalPage,
      meta: {
        name: "Mentions légales",
        breadcrumbLinks: () => [
          getHomeBreadcrumbLink(),
          { label: "Mentions légales", name: "legal" },
        ],
      },
    },
    // Contact page
    {
      path: "/contact-contributions",
      name: "contact",
      component: ContactPage,
      meta: {
        name: "Contact",
        breadcrumbLinks: [
          { label: "Accueil", name: "home" },
          { label: "Contactez-nous ou contribuez", name: "contact" },
        ],
      },
    },
    // Account pages
    // TODO: add meta
    {
      path: "/compte/nouveau",
      name: "new-account",
      component: NewAccountPage,
    },
    {
      path: "/compte/validation",
      name: "new-account-validation",
      component: NewAccountValidationPage,
    },
    {
      path: "/compte/connexion",
      name: "login",
      component: LoginPage,
    },
    {
      path: "/compte",
      name: "account-dashboard",
      component: AccountDashboardPage,
    },
    {
      path: "/compte/parametres",
      name: "account-settings",
      component: AccountSettingsPage,
      meta: {
        name: "Mon compte",
        breadcrumbLinks: () => [
          getHomeBreadcrumbLink(),
          { label: "Mon compte", name: "account-settings" },
        ],
      },
    },
    {
      path: "/compte/avis-suppression-compte",
      name: "account-deletion-feedback",
      component: AccountDeletionFeedback,
      meta: {
        name: "Suppression compte",
        breadcrumbLinks: () => [
          getHomeBreadcrumbLink(),
          { label: "Suppression compte", name: "account-deletion-feedback" },
        ],
      },
      beforeEnter() {
        // Check that a feedback token is present in the store, otherwise redirect to homepage.
        const accountStore = useAccountStore();
        if (!accountStore.accountDeletionFeedbackToken) {
          return { name: "home" };
        }
      },
    },
    // Audit pages
    {
      path: "/audits/nouveau",
      name: "new-audit-step-one",
      component: NewAuditStepOnePage,
      meta: {
        name: "Nouvel audit",
        breadcrumbLinks: () => [
          getHomeBreadcrumbLink(),
          { label: "Nouvel audit", name: "new-audit-step-one" },
        ],
      },
    },
    {
      path: "/audits/:uniqueId/informations-generales",
      name: "edit-audit-step-one",
      component: EditAuditStepOnePage,
      beforeEnter: saveCurrentEditionStep,
      meta: {
        name: "Mon audit",
        breadcrumbLinks: () => [
          getHomeBreadcrumbLink(),
          {
            label: getProcedureName(),
            name: "edit-audit-step-one",
          },
        ],
      },
    },
    {
      path: "/audits/:uniqueId/generation",
      name: "edit-audit-step-three",
      component: EditAuditStepThreePage,
      beforeEnter: saveCurrentEditionStep,
      meta: {
        name: "Mon audit",
        breadcrumbLinks: () => [
          getHomeBreadcrumbLink(),
          {
            label: getProcedureName(),
            name: "edit-audit-step-three",
          },
        ],
      },
    },
    {
      path: "/audits/:uniqueId/partage",
      name: "edit-audit-step-four",
      component: EditAuditStepFourPage,
      beforeEnter: saveCurrentEditionStep,
      meta: {
        name: "Mon audit",
        breadcrumbLinks: () => [
          getHomeBreadcrumbLink(),
          {
            label: getProcedureName(),
            name: "edit-audit-step-four",
          },
        ],
      },
    },
    {
      path: "/audits/:uniqueId/declaration",
      name: "edit-audit-declaration",
      component: EditAuditDeclarationPage,
      beforeEnter: saveCurrentEditionStep,
      meta: {
        name: "Mon audit",
        breadcrumbLinks: () => [
          getHomeBreadcrumbLink(),
          {
            label: getProcedureName(),
            name: "edit-audit-declaration",
          },
        ],
      },
    },
    // Report pages
    {
      path: "/rapports/:uniqueId/contexte",
      name: "context",
      component: ContextPage,
      meta: {
        name: "Contexte",
        hideHomeLink: true,
        breadcrumbLinks: () => [
          { label: "Rapport d’audit", name: "report" },
          { label: "Contexte", name: "context" },
        ],
      },
    },
    {
      path: "/rapports/:uniqueId/:tab?",
      name: "report",
      component: ReportPage,
      meta: {
        name: "Rapport d’audit",
        hideHomeLink: true,
      },
    },
    // Roadmap
    {
      path: "/feuille-de-route",
      name: "roadmap",
      component: RoadmapPage,
      meta: {
        name: "Feuille de route",
        breadcrumbLinks: () => [
          getHomeBreadcrumbLink(),
          { label: "Feuille de route", name: "roadmap" },
        ],
      },
    },
    // Changelog
    {
      path: "/notes-de-versions",
      name: "changelog",
      component: ChangelogPage,
      meta: {
        name: "Notes de versions",
        breadcrumbLinks: () => [
          getHomeBreadcrumbLink(),
          { label: "Notes de versions", name: "changelog" },
        ],
      },
    },
    // Resources pages
    {
      path: "/ressources",
      name: "resources",
      component: ResourcesPage,
      meta: {
        name: "Ressources",
        breadcrumbLinks: () => [
          getHomeBreadcrumbLink(),
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
        breadcrumbLinks: () => [
          getHomeBreadcrumbLink(),
          { label: "Ressources", name: "resources" },
          { label: "Formations accessibilité", name: "accessibility-training" },
        ],
      },
    },
    {
      path: "/ressources/formations-accessibilite/introduction-accessibilite-numerique",
      name: "a11y-intro-training",
      component: A11yIntroTrainingPage,
      meta: {
        name: "Introduction à l’accessibilité numérique",
        breadcrumbLinks: () => [
          getHomeBreadcrumbLink(),
          { label: "Ressources", name: "resources" },
          { label: "Formations accessibilité", name: "accessibility-training" },
          {
            label: "Introduction à l’accessibilité numérique",
            name: "a11y-intro-training",
          },
        ],
      },
    },
    {
      path: "/ressources/formations-accessibilite/numerique-public",
      name: "public-digital",
      component: PublicDigitalTrainingPage,
      meta: {
        name: "Bien faire du numérique public",
        breadcrumbLinks: () => [
          getHomeBreadcrumbLink(),
          { label: "Ressources", name: "resources" },
          { label: "Formations accessibilité", name: "accessibility-training" },
          {
            label: "Bien faire du numérique public",
            name: "public-digital",
          },
        ],
      },
    },
    {
      path: "/ressources/outils",
      name: "tools",
      component: ToolsPage,
      meta: {
        name: "Outils",
        breadcrumbLinks: () => [
          getHomeBreadcrumbLink(),
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
        breadcrumbLinks: () => [
          getHomeBreadcrumbLink(),
          { label: "Ressources", name: "resources" },
          { label: "Glossaire", name: "glossary" },
        ],
      },
    },
    {
      path: "/ressources/realiser-audit-accessibilite",
      name: "make-a11y-audit",
      component: MakeA11yAuditPage,
      meta: {
        name: "Réaliser un audit accessibilité",
        breadcrumbLinks: () => [
          getHomeBreadcrumbLink(),
          { label: "Ressources", name: "resources" },
          {
            label: "Réaliser soi-même un audit accessibilité",
            name: "make-a11y-audit",
          },
        ],
      },
    },

    {
      path: "/ressources/obligations-legales",
      name: "legal-requirements",
      component: LegalRequirementsPage,
      meta: {
        name: "Obligations légales et sanctions",
        breadcrumbLinks: () => [
          getHomeBreadcrumbLink(),
          { label: "Ressources", name: "resources" },
          {
            label: "Obligations légales et sanctions",
            name: "legal-requirements",
          },
        ],
      },
    },
    {
      path: "/ressources/rgaa",
      name: "rgaa",
      component: RGAAPage,
      meta: {
        name: "RGAA",
        breadcrumbLinks: () => [
          getHomeBreadcrumbLink(),
          { label: "Ressources", name: "resources" },
          { label: "RGAA", name: "rgaa" },
        ],
      },
    },
    {
      path: "/ressources/declaration-accessibilite",
      name: "accessibility-statement",
      component: AccessibilityStatementPage,
      meta: {
        name: "Déclaration d’accessibilité",
        breadcrumbLinks: () => [
          getHomeBreadcrumbLink(),
          { label: "Ressources", name: "resources" },
          {
            label: "Déclaration d’accessibilité",
            name: "accessibility-statement",
          },
        ],
      },
    },
    {
      path: "/ressources/schema-pluriannuel",
      name: "accessibility-plan",
      component: AccessibilityPlanPage,
      meta: {
        name: "Schéma pluriannuel",
        breadcrumbLinks: () => [
          getHomeBreadcrumbLink(),
          { label: "Ressources", name: "resources" },
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
        breadcrumbLinks: () => [
          getHomeBreadcrumbLink(),
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

router.beforeEach((to, from) => {
  if (from.query.dev && !to.query.dev) {
    return {
      ...to,
      query: {
        ...to.query,
        dev: from.query.dev,
      },
    };
  }
});

export default router;
