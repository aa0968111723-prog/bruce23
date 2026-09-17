import { useLayoutEffect } from "react";
import { keepLastMatches } from "@/lib/dom/keep-last";

/**
 * Dev + Playwright can leave the streamed SSR shell in `document.body`
 * next to the client tree when `hydrateRoot(document)` does not adopt it
 * (Grok preview injector, duplicate head tags). Two SiteShells stack
 * visually and duplicate ExperiencePanel tabs. Keep the last live copy.
 */
export function DedupHydratedShells() {
  useLayoutEffect(() => {
    keepLastMatches(document, "[data-luminous-shell]");
    keepLastMatches(document, "[data-sonner-toaster]");
    keepLastMatches(document, 'section[aria-label="Notifications alt+T"]');
    document.documentElement.dataset.luminousHydrated = "1";
  }, []);
  return null;
}
