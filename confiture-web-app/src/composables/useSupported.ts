import { computed } from "vue";

import { useMounted } from "./useMounted";

export function useSupported(callback: () => unknown) {
  const isMounted = useMounted();

  return computed(() => {
    // to trigger the ref
    isMounted.value;
    return Boolean(callback());
  });
}

export type UseSupportedReturn = ReturnType<typeof useSupported>;
