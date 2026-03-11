import { FirstTab } from "./enums";

/**
 * Route redirects with creation date so we know
 * if we can delete them forever or if it's too early.
 */
export default [
  // Creation date: 24/04/2024
  {
    path: "/audits/:uniqueId/informations-generales",
    name: "audit-settings-old",
    redirect: () => {
      return { name: "audit-settings" };
    }
  },
  // Creation date: ~2024
  {
    path: "/audits/:uniqueId/partage",
    name: "edit-audit-step-four",
    redirect: () => {
      return { name: "audit-overview" };
    }
  },
  // Creation date: 17/04/2024
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
  // Creation date: 17/04/2024
  {
    path: "/declarations/:uniqueId",
    name: "a11y-statement-old",
    redirect: () => {
      return { name: "a11y-statement" };
    }
  }
];
