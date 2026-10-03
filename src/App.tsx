import { MotionConfig } from "motion/react";
import { Footer, Header } from "@/components/Shell";
import { Hero, Receipts } from "@/sections/Hero";
import { Facts, Perks, Program } from "@/sections/Program";
import { Cost, Founders } from "@/sections/Founders";
import { Apply, Closing } from "@/sections/Apply";

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#main">
        skip to content
      </a>
      <Header />
      <main id="main">
        <Hero />
        <Receipts />
        <Facts />
        <Perks />
        <Program />
        <Founders />
        <Cost />
        <Apply />
        <Closing />
      </main>
      <Footer />
    </MotionConfig>
  );
}
