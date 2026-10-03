import { useEffect } from "react";
import { MotionConfig } from "motion/react";
import { Footer, Header } from "@/components/Shell";
import { Hero, Receipts } from "@/sections/Hero";
import { Offer } from "@/sections/Program";
import { Founders } from "@/sections/Founders";
import { Apply, Closing } from "@/sections/Apply";
import { useRoute } from "@/lib/router";
import { site } from "@/content";

const TITLES: Record<string, string> = {
  "/": `${site.name}: ${site.tagline}`,
  "/apply": `apply to cohort 01 | ${site.name}`,
};

function Landing() {
  return (
    <main id="main">
      <Hero />
      <Receipts />
      <Offer />
      <Founders />
      <Closing />
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
      {route === "/apply" ? <ApplyPage /> : <Landing />}
      <Footer />
    </MotionConfig>
  );
}
