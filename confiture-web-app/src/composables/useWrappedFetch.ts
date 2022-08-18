import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

/**
 * Hook wrapping a function returning a promise. If the function fails with
 * a network error, the user is redirected to the error page.
 *
 * Use this hook when you want to fetch data and display an error page
 * if the request fails.
 *
 * @example useWrappedFetch(() => auditStore.fetchAuditIfNeeded(uniqueId));
 */
export function useWrappedFetch(func: () => Promise<unknown>) {
  const router = useRouter();
  const route = useRoute();

  onMounted(() => {
    func().catch((error) => {
      const errorStatus: number = error?.response?.status || 404;

      if ([404, 410].includes(errorStatus)) {
        router.replace({
          name: "Error",
          params: { pathMatch: route.path.substring(1).split("/") },
          query: route.query,
          hash: route.hash,
          state: {
            errorStatus,
          },
        });
      }
    });
  });
}
