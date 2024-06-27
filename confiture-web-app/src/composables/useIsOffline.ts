import { computed } from "vue";

import { useSystemStore } from "../store";

export function useIsOffline() {
  const systemStore = useSystemStore();
  return computed(() => !systemStore.isOnline);
}
