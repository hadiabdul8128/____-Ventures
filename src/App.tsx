import { Suspense, lazy, useEffect } from "react";
import { MotionConfig } from "motion/react";
import { Footer, Header } from "@/components/Shell";
import { Hero, Receipts } from "@/sections/Hero";
import { Offer, Tracks } from "@/sections/Program";
import { Founders } from "@/sections/Founders";
import { Apply, Closing } from "@/sections/Apply";
import { PreFounderApply } from "@/sections/PreFounderApply";
import { AmbassadorApply } from "@/sections/AmbassadorApply";
import { useRoute } from "@/lib/router";
import { LoginChooser } from "@/waitlist/LoginChooser";
import { Events } from "@/events/Events";
import { site } from "@/content";
import InteractiveNeuralVortex from "@/components/ui/interactive-neural-vortex-background";

/**
 * Lazy so the landing page never downloads the cohort dashboard. The chunk is
 * just UI: the cohort's content is fetched from Supabase after sign-in.
 */
const Dashboard = lazy(() =>
  import("@/dashboard/Dashboard").then((m) => ({ default: m.Dashboard })),
);

const Waitlist = lazy(() =>
  import("@/waitlist/Waitlist").then((m) => ({ default: m.Waitlist })),
);

/** Full-screen app routes: no marketing header or footer. */
const APP_ROUTES = new Set(["/cohort-01", "/login", "/waitlist"]);

const TITLES: Record<string, string> = {
  "/": `${site.name}: ${site.tagline}`,
  "/apply": `apply to the fellowship track | ${site.name}`,
  "/apply/pre-founder": `apply to the pre-founder track | ${site.name}`,
  "/apply/scout": `apply to the campus scout program | ${site.name}`,
  "/cohort-01": `cohort 01 dashboard | ${site.name}`,
  "/login": `log in | ${site.name}`,
  "/waitlist": `waitlist dashboard | ${site.name}`,
  "/events": `events | ${site.name}`,
};

function Landing() {
  return (
    <main id="main">
      <Hero />
      <Receipts />
      <div className="venture-flow">
        <InteractiveNeuralVortex />
        <Tracks />
        <Offer />
        <Founders />
        <Closing />
      </div>
    </main>
  );
}

function ApplyPage() {
  return (
    <main id="main" className="apply-page">
      <Apply />
    </main>
  );
}

export default function App() {
  const route = useRoute();

  useEffect(() => {
    document.title = TITLES[route] ?? TITLES["/"];
    // Keep the sign-in page out of search results.
    let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (APP_ROUTES.has(route)) {
      if (!robots) {
        robots = document.createElement("meta");
        robots.name = "robots";
        document.head.appendChild(robots);
      }
      robots.content = "noindex, nofollow";
    } else {
      robots?.remove();
    }
  }, [route]);

  return (
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#main">
        skip to content
      </a>
      {!APP_ROUTES.has(route) && <Header />}
      {route === "/cohort-01" ? (
        <Suspense fallback={null}>
          <Dashboard />
        </Suspense>
      ) : route === "/login" ? (
        <LoginChooser />
      ) : route === "/waitlist" ? (
        <Suspense fallback={null}>
          <Waitlist />
        </Suspense>
      ) : route === "/events" ? (
        <Events />
      ) : route === "/apply" ? (
        <ApplyPage />
      ) : route === "/apply/scout" ? (
        <main id="main" className="apply-page">
          <AmbassadorApply />
        </main>
      ) : route === "/apply/pre-founder" ? (
        <main id="main" className="apply-page">
          <PreFounderApply />
        </main>
      ) : (
        <Landing />
      )}
      {!APP_ROUTES.has(route) && <Footer />}
    </MotionConfig>
  );
}
