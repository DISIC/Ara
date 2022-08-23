import { RouteLocation, useRouter } from "vue-router";
import { history } from "../router";

interface UsePreviousRouteResult {
  route: RouteLocation | null;
  url: string | null;
}

/**
 * @returns The route object of the previous page if any.
 */
export function usePreviousRoute(): UsePreviousRouteResult {
  const router = useRouter();

  if (!history.state.back) {
    return { route: null, url: null };
  }

  const route = router.resolve(history.state.back as string);

  return {
    route,
    url: history.state.back as string,
  };
}
