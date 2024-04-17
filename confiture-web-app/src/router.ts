import { createRouter, createWebHistory, RouteLocation } from "vue-router";

import AccountDashboardPage from "./pages/account/AccountDashboardPage.vue";
import AccountDeletionFeedback from "./pages/account/AccountDeletionFeedback.vue";
import AccountSettingsPage from "./pages/account/AccountSettingsPage.vue";
import LoginPage from "./pages/account/LoginPage.vue";
import MissingAuditPage from "./pages/account/MissingAuditPage.vue";
import NewAccountPage from "./pages/account/NewAccountPage.vue";
import NewAccountValidationPage from "./pages/account/NewAccountValidationPage.vue";
import ResetPasswordPage from "./pages/account/ResetPasswordPage.vue";
import UpdateEmailValidationPage from "./pages/account/UpdateEmailValidationPage.vue";
import AuditDeclarationPage from "./pages/audit/AuditDeclarationPage.vue";
import AuditGenerationPage from "./pages/audit/AuditGenerationPage.vue";
import AuditOverviewPage from "./pages/audit/AuditOverviewPage.vue";
import AuditSettingsPage from "./pages/audit/AuditSettingsPage.vue";
import CreateAuditPage from "./pages/audit/CreateAuditPage.vue";
import ChangelogPage from "./pages/ChangelogPage.vue";
import ErrorPage from "./pages/error/ErrorPage.vue";
import FeedbackPage from "./pages/FeedbackPage.vue";
import HomePage from "./pages/HomePage.vue";
import AccessibilityPage from "./pages/misc/AccessibilityPage.vue";
import ContactPage from "./pages/misc/ContactPage.vue";
import LegalPage from "./pages/misc/LegalPage.vue";
import PrivacyPage from "./pages/misc/PrivacyPage.vue";
import SiteMapPage from "./pages/misc/SiteMapPage.vue";
import ContextPage from "./pages/report/ContextPage.vue";
import ReportPage from "./pages/report/ReportPage.vue";
import StatementPage from "./pages/StatementPage.vue";
import RoadmapPage from "./pages/RoadmapPage.vue";
import { useAccountStore, useAuditStore } from "./store";

declare module "vue-router" {
  interface RouteMeta {
    // add a `meta.name` property to have the route's name appear in "go back to [name]" prompts
    name: string;
    hideHomeLink?: boolean;
    authRequired?: boolean;
  }
}

export const history = createWebHistory();

/**
 * Fetch the audit name from store to display in meta.
 */
function getProcedureName() {
  const auditStore = useAuditStore();
  return auditStore.currentAudit?.procedureName ?? "Mon audit";
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
        name: "Accueil"
      }
    },
    {
      path: "/plan-du-site",
      name: "site-map",
      component: SiteMapPage,
      meta: {
        name: "Plan du site"
      }
    },
    {
      path: "/accessibilite",
      name: "accessibility",
      component: AccessibilityPage,
      meta: {
        name: "Accessibilité"
      }
    },
    {
      path: "/donnees-personnelles",
      name: "privacy",
      component: PrivacyPage,
      meta: {
        name: "Données personnelles"
      }
    },
    {
      path: "/mentions-legales",
      name: "legal",
      component: LegalPage,
      meta: {
        name: "Mentions légales"
      }
    },
    // Contact page
    {
      path: "/contact-contributions",
      name: "contact",
      component: ContactPage,
      meta: {
        name: "Contact"
      }
    },
    // Account pages
    {
      path: "/compte/nouveau",
      name: "new-account",
      component: NewAccountPage,
      meta: {
        name: "Créer votre compte Ara"
      }
    },
    {
      path: "/compte/validation",
      name: "new-account-validation",
      component: NewAccountValidationPage,
      meta: {
        name: "Valider votre compte Ara"
      }
    },
    {
      path: "/compte/email-update-validation",
      name: "email-update-validation",
      component: UpdateEmailValidationPage,
      meta: {
        name: "Changement d'adresse e-mail"
      }
    },
    {
      path: "/compte/connexion",
      name: "login",
      component: LoginPage,
      meta: {
        name: "Connexion à Ara"
      }
    },
    {
      path: "/compte/reinitialiser-mot-de-passe",
      name: "password-reset",
      component: ResetPasswordPage,
      meta: {
        name: "Réinitialiser votre mot de passe"
      }
    },
    {
      path: "/compte",
      name: "account-dashboard",
      component: AccountDashboardPage,
      meta: {
        name: "Mes audits",
        authRequired: true
      }
    },
    {
      path: "/compte/parametres",
      name: "account-settings",
      component: AccountSettingsPage,
      meta: {
        authRequired: true,
        name: "Mon compte"
      }
    },
    {
      path: "/compte/avis-suppression-compte",
      name: "account-deletion-feedback",
      component: AccountDeletionFeedback,
      meta: {
        name: "Suppression compte"
      },
      beforeEnter() {
        // Check that a feedback token is present in the store, otherwise redirect to homepage.
        const accountStore = useAccountStore();
        if (!accountStore.accountDeletionFeedbackToken) {
          return { name: "home" };
        }
      }
    },
    {
      path: "/audit-manquant",
      name: "missing-audit",
      component: MissingAuditPage,
      meta: {
        name: "Je ne retrouve pas mon audit"
      }
    },
    // Audit pages
    {
      path: "/audits/nouveau",
      name: "create-audit",
      component: CreateAuditPage,
      meta: {
        name: "Nouvel audit"
      }
    },
    {
      path: "/audits/:uniqueId/informations-generales",
      name: "audit-settings",
      component: AuditSettingsPage,
      beforeEnter: saveCurrentEditionStep,
      meta: {
        name: "Mon audit"
      }
    },
    {
      path: "/audits/:uniqueId/generation",
      name: "audit-generation",
      component: AuditGenerationPage,
      beforeEnter: saveCurrentEditionStep,
      meta: {
        name: "Mon audit"
      }
    },
    {
      path: "/audits/:uniqueId/declaration",
      name: "audit-declaration",
      component: AuditDeclarationPage,
      beforeEnter: saveCurrentEditionStep,
      meta: {
        name: "Mon audit"
      }
    },
    // TODO: remove this redirect in few months?
    {
      path: "/audits/:uniqueId/partage",
      name: "edit-audit-step-four",
      redirect: () => {
        return { name: "audit-overview" };
      }
    },
    // Overview
    {
      path: "/audits/:uniqueId/synthese",
      name: "audit-overview",
      component: AuditOverviewPage,
      meta: {
        name: `Synthèse ${getProcedureName}`
      }
    },
    // Report pages
    {
      path: "/rapport/:uniqueId/contexte",
      name: "context",
      component: ContextPage,
      meta: {
        name: "Contexte",
        hideHomeLink: true
      }
    },
    // TODO: remove this redirect in few months (17/04/2024)
    {
      path: "/rapports/:uniqueId/contexte",
      name: "context-old",
      redirect: () => {
        return { name: "context" };
      }
    },
    {
      path: "/rapport/:uniqueId/:tab?",
      name: "report",
      component: ReportPage,
      meta: {
        name: "Rapport d’audit",
        hideHomeLink: true
      }
    },
    // TODO: remove this redirect in few months (17/04/2024)
    {
      path: "/rapports/:uniqueId/:tab?",
      name: "report-old",
      redirect: () => {
        return { name: "report" };
      }
    },
    // a11y statement
    {
      path: "/declaration/:uniqueId",
      name: "a11y-statement",
      component: StatementPage,
      meta: {
        name: "Déclaration d’accessibilité"
      }
    },
    // TODO: remove this redirect in few months (17/04/2024)
    {
      path: "/declarations/:uniqueId",
      name: "a11y-statement-old",
      redirect: () => {
        return { name: "a11y-statement" };
      }
    },
    // Roadmap
    {
      path: "/feuille-de-route",
      name: "roadmap",
      component: RoadmapPage,
      meta: {
        name: "Feuille de route"
      }
    },
    // Changelog
    {
      path: "/notes-de-versions",
      name: "changelog",
      component: ChangelogPage,
      meta: {
        name: "Notes de versions"
      }
    },
    // Feedback page
    {
      path: "/donner-mon-avis",
      name: "feedback",
      component: FeedbackPage,
      meta: {
        name: "Donner mon avis"
      }
    },
    // Error pages
    {
      path: "/:pathMatch(.*)*",
      name: "Error",
      component: ErrorPage
    }
  ],
  history,
  scrollBehavior(to) {
    if (!to.hash) {
      return { top: 0 };
    }
  }
});

router.beforeEach((to, from) => {
  if (from.query.dev && !to.query.dev) {
    return {
      ...to,
      query: {
        ...to.query,
        dev: from.query.dev
      }
    };
  }
});

router.beforeEach((to) => {
  const accountStore = useAccountStore();
  if (to.meta.authRequired && !accountStore.account) {
    return { name: "login" };
  }
});

// Reset focus on <body> + announce new page title
router.afterEach(async (to, from) => {
  if (from.path !== to.path) {
    const pageTitleAlert = document.querySelector("#page-title-alert");
    if (pageTitleAlert) {
      pageTitleAlert.innerHTML = `<p>${to.meta.name}</p>`;

      setTimeout(() => {
        pageTitleAlert.innerHTML = "";
      }, 2000);
    }

    document.body.setAttribute("tabindex", "-1");
    document.body.focus();
    document.body.removeAttribute("tabindex");
  }
});

export default router;
