import { useResizeObserver } from "@vueuse/core";
import {
  createRouter,
  createWebHistory,
  RouteLocationNormalized
} from "vue-router";

import AraTabsPanel from "./components/audit/AraTabsPanel.vue";
import { FirstTab } from "./enums";
import AccountDashboardPage from "./pages/account/AccountDashboardPage.vue";
import AccountDeletionFeedback from "./pages/account/AccountDeletionFeedback.vue";
import AccountSettingsPage from "./pages/account/AccountSettingsPage.vue";
import LoginPage from "./pages/account/LoginPage.vue";
import MissingAuditPage from "./pages/account/MissingAuditPage.vue";
import NewAccountPage from "./pages/account/NewAccountPage.vue";
import NewAccountValidationPage from "./pages/account/NewAccountValidationPage.vue";
import ResetPasswordPage from "./pages/account/ResetPasswordPage.vue";
import UpdateEmailValidationPage from "./pages/account/UpdateEmailValidationPage.vue";
import AuditCreatePage from "./pages/audit/AuditCreatePage.vue";
import AuditDeclarationPage from "./pages/audit/AuditDeclarationPage.vue";
import AuditGenerationPage from "./pages/audit/AuditGenerationPage.vue";
import AuditOverviewPage from "./pages/audit/AuditOverviewPage.vue";
import AuditSettingsPage from "./pages/audit/AuditSettingsPage.vue";
import ChangelogPage from "./pages/ChangelogPage.vue";
import ErrorPage from "./pages/error/ErrorPage.vue";
import FeedbackPage from "./pages/FeedbackPage.vue";
import HomePage from "./pages/HomePage.vue";
import MarkdownHelperPage from "./pages/MarkdownHelperPage.vue";
import AccessibilityPage from "./pages/misc/AccessibilityPage.vue";
import ContactPage from "./pages/misc/ContactPage.vue";
import LegalPage from "./pages/misc/LegalPage.vue";
import PrivacyPage from "./pages/misc/PrivacyPage.vue";
import SiteMapPage from "./pages/misc/SiteMapPage.vue";
import ReportPage from "./pages/report/ReportPage.vue";
import RoadmapPage from "./pages/RoadmapPage.vue";
import StatementPage from "./pages/StatementPage.vue";
import { useAccountStore, useAuditStore } from "./store";
import { ScrollBehaviorResult, ScrollPosition } from "./types";
import { getScrollBehavior } from "./utils";

declare module "vue-router" {
  interface RouteMeta {
    // add a `meta.name` property to have the route's name appear in "go back to [name]" prompts
    name: string | (() => string);
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
  return auditStore.currentAudit?.procedureName ?? "de mon audit";
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
      component: AuditCreatePage,
      meta: {
        name: "Nouvel audit"
      }
    },
    {
      path: "/audits/:uniqueId/parametres",
      name: "audit-settings",
      component: AuditSettingsPage,
      meta: {
        name: "Mon audit"
      }
    },
    // TODO: remove this redirect in few months (24/04/2024)
    {
      path: "/audits/:uniqueId/informations-generales",
      name: "audit-settings-old",
      redirect: () => {
        return { name: "audit-settings" };
      }
    },
    {
      path: "/audits/:uniqueId/generation",
      name: "audit-generation",
      redirect: (to: any) => {
        return {
          name: "audit-generation-full",
          params: {
            uniqueId: to.params.uniqueId,
            tabSlug: FirstTab.AUDIT_SLUG
          }
        };
      },
      component: AuditGenerationPage,
      children: [
        {
          path: ":tabSlug",
          name: "audit-generation-full",
          component: AraTabsPanel
        }
      ],
      meta: {
        name: "Mon audit"
      },
      props: true
    },
    {
      path: "/audits/:uniqueId/declaration",
      name: "audit-declaration",
      component: AuditDeclarationPage,
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
        name: () => `Synthèse ${getProcedureName()}`
      }
    },
    // Report pages
    {
      path: "/rapport/:uniqueId/",
      name: "report",
      redirect: (to: any) => {
        return {
          name: "report-full",
          params: {
            uniqueId: to.params.uniqueId,
            tabSlug: FirstTab.REPORT_SLUG
          }
        };
      },
      component: ReportPage,
      children: [
        {
          path: ":tabSlug",
          name: "report-full",
          component: AraTabsPanel
        }
      ],
      meta: {
        name: "Rapport d’audit",
        hideHomeLink: true
      },
      props: true
    },
    // TODO: remove this redirect in few months (17/04/2024)
    {
      path: "/rapports/:uniqueId/:tabSlug?",
      name: "report-old",
      redirect: (to: any) => {
        const tabSlug = to.params.tabSlug;
        return {
          name: "report-full",
          params: {
            uniqueId: to.params.uniqueId,
            tabSlug: tabSlug.length > 0 ? tabSlug : FirstTab.REPORT_SLUG
          }
        };
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
    // Markdown helper
    {
      path: "/syntaxe-markdown",
      name: "markdown-syntax",
      component: MarkdownHelperPage,
      meta: {
        name: "Syntaxe Markdown"
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
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      if (isTabNavigation(to, from)) {
        horizontalScrollToNewTab(to.params.tabSlug as string);
      }
      return scrollToPosition(savedPosition);
    }

    if (to.hash) {
      return scrollToHash(to.hash);
    }

    // When navigating between tabs, scroll to display tabs
    // at the top of the screen
    if (isTabNavigation(to, from)) {
      const tabs = document.querySelector(".tabs-wrapper") as HTMLElement;
      if (!tabs) {
        // When navigating between tabs with the "tabSlug" route parameter,
        // there should be an Element with class "tabs-wrapper"
        console.warn("No tabs?!");
      } else {
        horizontalScrollToNewTab(to.params.tabSlug as string);
        const behavior = tabs.dataset.panelScrollBehavior;
        if (behavior === "tabsTop") {
          return scrollToTabPanelTop(tabs);
        } else {
          // behavior === "sameCriteria"
          return scrollToElement(tabs);
        }
      }
    }

    return scrollToTop();
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
      pageTitleAlert.innerHTML = `<p>${
        typeof to.meta.name === "function" ? to.meta.name() : to.meta.name
      }</p>`;

      setTimeout(() => {
        pageTitleAlert.innerHTML = "";
      }, 2000);
    }

    if (!to.hash && !isTabNavigation(to, from)) {
      document.body.setAttribute("tabindex", "-1");
      document.body.focus();
      document.body.removeAttribute("tabindex");
    }
  }
});

function isTabNavigation(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized
) {
  return (
    to.name === from.name &&
    to.params.tabSlug !== undefined &&
    to.params.tabSlug !== from.params.tabSlug
  );
}

function horizontalScrollToNewTab(tabSlug: string) {
  const tabs = document.querySelector(".tabs-wrapper") as HTMLElement;
  if (!tabs) {
    // When navigating between tabs with the "tabSlug" route parameter,
    // there should be an Element with class "tabs-wrapper"
    console.warn("No tabs?");
    return;
  }

  // Make the current tab always visible horizontally.
  // Especially, when navigating backward or forward,
  // user does not select explicitely a tab button
  const tabButton = tabs.querySelector(`[data-slug="${tabSlug}"]`);
  tabButton?.scrollIntoView({ behavior: getScrollBehavior() });
}

/**
 * Scrolls to the top of the screen
 */
function scrollToTop() {
  return { top: 0 };
}

/**
 * Scrolls to a given hash (without leading '#').
 * There must be an HTML element with `id=hash` in the current page.
 */
function scrollToHash(hash: string): ScrollBehaviorResult {
  return new Promise((resolve) => {
    const { stop } = useResizeObserver(document.body, () => {
      const hashEl = document.querySelector(
        "#" + CSS.escape(hash.substring(1))
      ) as HTMLElement;
      if (hashEl) {
        // Force hash focus
        // (usefull when hash element is not in the DOM on page load)
        hashEl.focus();
        const scrollMargin = parseFloat(
          window.getComputedStyle(hashEl).scrollMargin
        );
        resolve({ el: hashEl, top: scrollMargin });
        stop();
      }
    });
  });
}

function scrollToPosition(
  scrollPosition: ScrollPosition
): ScrollBehaviorResult {
  return new Promise((resolve) => {
    const { stop } = useResizeObserver(document.body, async () => {
      const htmlEl = document.getElementsByTagName("html")[0];
      if (htmlEl.scrollHeight > htmlEl.clientHeight) {
        resolve(scrollPosition);
        stop();
      }
    });
  });
}

/**
 * Scrolls to the top of a given tab panel
 */
function scrollToTabPanelTop(tabs: HTMLElement): ScrollBehaviorResult {
  const panel = tabs.nextElementSibling as HTMLElement;
  const tabComputedStyle = window.getComputedStyle(tabs);

  // Can be a smooth scroll if tabs are below the top of the screen,
  // Otherwise it's an instant scroll.
  const behavior =
    tabs.getBoundingClientRect().top > 0 ? getScrollBehavior() : "instant";

  return new Promise((resolve) => {
    const { stop } = useResizeObserver(document.body, async (entries) => {
      const scrollMargin =
        parseFloat(tabComputedStyle.top) + parseFloat(tabComputedStyle.height);
      if (entries[0].target.clientHeight >= scrollMargin + screen.height) {
        const scrollPosition = {
          el: panel,
          top: scrollMargin,
          behavior
        };
        resolve(scrollPosition);
        stop();
      }
    });
  });
}

/**
 * Scrolls to the top of a given HTML element
 *
 * @todo TODO: scroll to a smart position (same criteria as previous tabSlug?)
 */
function scrollToElement(el: HTMLElement): ScrollBehaviorResult {
  return new Promise((resolve) => {
    const { stop } = useResizeObserver(document.body, async (entries) => {
      const scrollMargin = parseFloat(window.getComputedStyle(el).top);
      if (entries[0].target.clientHeight >= scrollMargin + screen.height) {
        const scrollPosition = {
          el,
          top: scrollMargin,
          behavior: getScrollBehavior()
        };
        resolve(scrollPosition);
        stop();
      }
    });
  });
}

export default router;
