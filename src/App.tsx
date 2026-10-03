import { Suspense, lazy, useEffect } from "react";
import { MotionConfig } from "motion/react";
import { Footer, Header } from "@/components/Shell";
import { Hero, Receipts } from "@/sections/Hero";
import { Offer } from "@/sections/Program";
import { Founders } from "@/sections/Founders";
import { Apply, Closing } from "@/sections/Apply";
import { useRoute } from "@/lib/router";
import { site } from "@/content";
import InteractiveNeuralVortex from "@/components/ui/interactive-neural-vortex-background";

/**
 * Dev only. `import.meta.env.DEV` is replaced with `false` at build time, so
 * the dynamic import sits in dead code and the dashboard never reaches the
 * production bundle. A static import would ship the VC board and curriculum
 * to every visitor even with the route blocked.
 */
const Dashboard = import.meta.env.DEV
  ? lazy(() =>
      import("@/dashboard/Dashboard").then((m) => ({ default: m.Dashboard })),
    )
  : null;

const TITLES: Record<string, string> = {
  "/": `${site.name}: ${site.tagline}`,
  "/apply": `apply to cohort 01 | ${site.name}`,
  "/dashboard": `founder dashboard | ${site.name}`,
};

function Landing() {
  return (
    <main id="main">
      <Hero />
      <Receipts />
      <div className="venture-flow">
        <InteractiveNeuralVortex />
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
  }, [route]);

  return (
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#main">
        skip to content
      </a>
      <Header />
      {route === "/dashboard" && Dashboard ? (
        <Suspense fallback={null}>
          <Dashboard />
        </Suspense>
      ) : route === "/apply" ? (
        <ApplyPage />
      ) : (
        <Landing />
      )}
      <Footer />
    </MotionConfig>
  );
}
