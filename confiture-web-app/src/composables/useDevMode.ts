import { computed } from "vue";
import { useRoute } from "vue-router";

export function useDevMode() {
  const route = useRoute();
  const isDevMode = computed(() => {
    return !!route.query.dev;
  });
  return isDevMode;
}
