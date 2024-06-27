import { TimeoutError } from "ky";
import { isEqual } from "lodash-es";
import { onMounted, watch } from "vue";
import { onBeforeRouteLeave, useRoute, useRouter } from "vue-router";

import { captureWithPayloads } from "../utils";

/**
 * Hook wrapping a function returning a promise. If the function fails with
 * a network error, the user is redirected to the error page.
 *
 * Use this hook when you want to fetch data and display an error page
 * if the request fails.
 *
 * @param watchParams If true, the given function will be called anytime the
 * route is the same but params change
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
        errorStatus
      }
    });

    captureWithPayloads(error);
  }

  onMounted(() => {
    func().catch(handleError);
  });

  if (watchParams) {
    const watchStopHandle = watch(
      () => route.params,
      (newParams, oldParams) => {
        // Make sure the params actually changed because if only the hash of the route
        // changed, the `params` objects will be equal but different references, which will trigger the watcher
        if (!isEqual(newParams, oldParams)) {
          func().catch(handleError);
        }
      }
    );

    onBeforeRouteLeave(watchStopHandle);
  }
}
