import { computed } from "vue";
import { useRoute } from "vue-router";

export function useDevMode() {
  const route = useRoute();
  const isDevMode = computed(() => {
    console.log(route.query.dev);
    return !!route.query.dev;
  });
  console.log(
    "🚀 ~ file: useDevMode.ts:11 ~ useDevMode ~ isDevMode:",
    isDevMode.value
  );
  return isDevMode;
}
