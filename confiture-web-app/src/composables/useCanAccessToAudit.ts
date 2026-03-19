import { RouteLocationAsRelativeGeneric } from "vue-router";
import { useAccountStore, useAuditStore } from "../store";
import { Audit } from "../types";

export interface canAccessToAudit {
  canAccess: boolean;
  redirectTo?: RouteLocationAsRelativeGeneric | null;
}

export async function useCanAccessToAudit(uniqueId: string): Promise<canAccessToAudit> {
  const auditStore = useAuditStore();
  await auditStore.fetchAuditIfNeeded(uniqueId).catch(() => {
    return { canAccess: false, redirectTo: { name: "Error", params: { pathMatch: "404" } } };
  });

  const currentAudit: Audit | null = auditStore.entities[uniqueId];
  if (!currentAudit) {
    return { canAccess: false, redirectTo: { name: "Error", params: { pathMatch: "404" } } };
  }

  if (currentAudit.isPublic) {
    return { canAccess: true };
  }

  const accountStore = useAccountStore();

  // if no login
  if (!accountStore || !accountStore.account) {
    return {
      canAccess: false,
      redirectTo: { name: "acces-restreint", params: { uniqueId } }
    };
  }

  // if auditor is owner of audit
  const isOwner = currentAudit.auditorEmail === accountStore.account.email;
  return {
    canAccess: isOwner,
    redirectTo: isOwner ? { name: "acces-restreint", params: { uniqueId } } : null
  };
}
