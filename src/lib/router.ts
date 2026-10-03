import { useEffect, useState } from "react";

/**
 * A two-page site does not need a router library. This tracks `location.pathname`
 * and intercepts in-app link clicks so moving between the landing page and the
 * application does not reload the bundle.
 *
 * Links carrying a hash (`/#founders`) are deliberately left to the browser:
 * native navigation already lands on the right section, and reimplementing that
 * scroll behaviour is more code than it is worth.
 */

const ROUTE_EVENT = "bsv:routechange";

export type Route = "/" | "/apply" | "/dashboard";

export function toRoute(pathname: string): Route {
  const path = pathname.replace(/\/+$/, "");
  if (path === "/apply") return "/apply";
  // Dev only for now: the production build drops the dashboard entirely, so
  // /dashboard cannot be reached on the live site until we add real auth.
  if (path === "/dashboard" && import.meta.env.DEV) return "/dashboard";
  return "/";
}

export function navigate(path: string) {
  if (path === window.location.pathname) return;
  window.history.pushState({}, "", path);
  window.dispatchEvent(new Event(ROUTE_EVENT));
}

function isPlainLeftClick(e: MouseEvent) {
  return (
    e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey
  );
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() =>
    toRoute(window.location.pathname),
  );

  useEffect(() => {
    const sync = () => setRoute(toRoute(window.location.pathname));

    const onClick = (e: MouseEvent) => {
      if (!isPlainLeftClick(e) || e.defaultPrevented) return;
      const anchor = (e.target as Element | null)?.closest?.("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("/") || href.includes("#")) return;
      if (anchor.target && anchor.target !== "_self") return;
      e.preventDefault();
      navigate(href);
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    };

    window.addEventListener("popstate", sync);
    window.addEventListener(ROUTE_EVENT, sync);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener(ROUTE_EVENT, sync);
      document.removeEventListener("click", onClick);
    };
  }, []);

  return route;
}
