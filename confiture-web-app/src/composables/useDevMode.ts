import { ref, watch } from "vue";
import { useDebugStore } from "../store";

export function useDevMode() {
  const debugStore = useDebugStore();
  const isDevMode = ref(debugStore.devMode);

  watch(
    () => debugStore.devMode,
    () => {
      isDevMode.value = debugStore.devMode;
    }
  );

  return isDevMode;
}
