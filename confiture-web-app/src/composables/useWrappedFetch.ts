import { onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { TimeoutError } from "ky";
import { captureWithPayloads } from "../utils";

/**
 * Hook wrapping a function returning a promise. If the function fails with
 * a network error, the user is redirected to the error page.
 *
 * Use this hook when you want to fetch data and display an error page
 * if the request fails.
 *
 * @param watchParams If true, the given function will be called anytime the route params change
 *
 * @example useWrappedFetch(() => auditStore.fetchAuditIfNeeded(uniqueId));
 */
export function useWrappedFetch(
  func: () => Promise<unknown>,
  watchParams = false
) {
  const router = useRouter();
  const route = useRoute();

  function handleError(error: any) {
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

    captureWithPayloads(error);
  }

  onMounted(() => {
    func().catch(handleError);
  });

  if (watchParams) {
    watch(
      () => route.params,
      () => {
        func().catch(handleError);
      }
    );
  }
}
