import { computed } from "vue";

import { useAccountStore, useAuditStore } from "../store";

/**
 * Make sure user is connected and owns the current audit (if any)
 */
export function useIsConnected() {
  const accountStore = useAccountStore();
  const auditStore = useAuditStore();

  return computed(() => {
    if (auditStore.currentAudit) {
      return (
        auditStore.currentAudit?.auditorEmail === accountStore.account?.email
      );
    }
    return accountStore.account?.email;
  });
}
