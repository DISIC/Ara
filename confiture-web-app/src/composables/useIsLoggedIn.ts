import { computed } from "vue";

import { useAccountStore } from "../store";

/**
 * Make sure user is logged in
 */
export function useIsLoggedIn() {
  const accountStore = useAccountStore();

  return computed(() => {
    return accountStore.account?.email;
  });
}
