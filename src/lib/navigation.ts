import { router } from "expo-router";

/**
 * router.back() with no navigation history (a deep link straight into
 * /edit or /review, or the router's own stack getting cleared) silently
 * no-ops and logs "GO_BACK was not handled by any navigator" instead of
 * taking the user anywhere — found by the S06 Playwright spec navigating
 * directly to /edit. Falls back to the camera screen instead.
 */
export function safeGoBack() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace("/");
  }
}
