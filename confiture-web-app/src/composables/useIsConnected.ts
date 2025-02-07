import { computed } from "vue";

import { useAccountStore } from "../store";

export function useIsConnected() {
  const store = useAccountStore();

  return computed(() => store.account?.email);
}
