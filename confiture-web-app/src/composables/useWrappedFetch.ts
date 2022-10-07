import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { TimeoutError } from "ky";

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
      let errorStatus = error?.response?.status;

      // display an 408 Request Timeout error page in case of ky request timing out
      if (error instanceof TimeoutError) {
        errorStatus = 408;
      }

      router.replace({
        name: "Error",
        params: { pathMatch: route.path.substring(1).split("/") },
        query: route.query,
        hash: route.hash,
        state: {
          errorStatus,
        },
      });
    });
  });
}
