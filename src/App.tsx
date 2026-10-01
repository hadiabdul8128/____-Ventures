import {
  createContext,
  lazy,
  Suspense,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Menu,
  Pause,
  Play,
  Plus,
  X,
} from "lucide-react";
import {
  MotionConfig,
  motion,
  useInView,
  useReducedMotion,
} from "motion/react";
import { GoldSculpture } from "./components/GoldSculpture";
import { GoldMonolith } from "./components/GoldMonolith";
import { InvitationStage } from "./components/boov/InvitationStage";
import {
  SmoothExperience,
  ScrollTypography,
  PointerHalo,
  ReadingProgress,
} from "./components/EditorialMotion";
const NetworkAtelier = lazy(() =>
  import("./components/boov/NetworkAtelier").then((module) => ({
    default: module.NetworkAtelier,
  })),
);
import { SceneBoundary } from "./components/SceneBoundary";
import {
  IntroductionDialog,
  type Audience,
} from "./components/IntroductionDialog";
import { Marquee } from "./components/ui/marquee";
import { AuroraText } from "./components/ui/aurora-text";
import { TextAnimate } from "./components/ui/text-animate";
import { Particles } from "./components/ui/particles";
import { Floating3DParticles } from "./components/ui/floating-3d-particles";
import { Meteors } from "./components/ui/meteors";
import { BorderBeam } from "./components/ui/border-beam";
import { Lens } from "./components/ui/lens";
import { HexagonPattern } from "./components/ui/hexagon-pattern";
import { NumberTicker } from "./components/ui/number-ticker";
import { AvatarCircles } from "./components/ui/avatar-circles";
import { VideoText } from "./components/ui/video-text";
import { InteractiveHoverButton } from "./components/ui/interactive-hover-button";

const NetworkScene = lazy(() => import("./components/NetworkScene"));
const MotionContext = createContext(true);
const golds = ["#af8b49", "#f1dba3", "#c8a45e", "#e5cb8b"];
const avatarUrls = ["founder", "builder", "investor"].map((name) => ({
  imageUrl: `/media/${name}.svg`,
  label: `${name} perspective`,
  profileUrl: "#connect",
}));

function Reveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const animate = useContext(MotionContext);
  return (
    <motion.div
      className={className}
      initial={animate ? { opacity: 0, y: 20 } : false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-35px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
function Ambient({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { margin: "80px" });
  const animate = useContext(MotionContext);
  return (
    <div ref={ref} className={`ambient ${className}`} aria-hidden="true">
      {visible && animate && children}
    </div>
  );
}
function Wordmark({
  footer = false,
  onNavigate,
}: {
  footer?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <a
      href="#top"
      onClick={onNavigate}
      className={`wordmark ${footer ? "footer-wordmark" : ""}`}
      aria-label="____ Ventures home"
    >
      <span className="brand-lines" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
      <span>
        VENTURES<span className="brand-dot">.</span>
      </span>
    </a>
  );
}

function Network({ onConnect }: { onConnect: (audience: Audience) => void }) {
  const [mode, setMode] = useState<"reach" | "circles" | "frontiers">("reach");
  const animate = useContext(MotionContext);
  const sceneRef = useRef<HTMLDivElement>(null);
  const visible = useInView(sceneRef, { margin: "150px" });
  const detail = {
    reach: [
      "Rooted in Cambridge.",
      "Open to the world.",
      "Exceptional ambition has no postcode. We find it at Harvard, MIT, and wherever it emerges.",
    ],
    circles: [
      "A smaller circle.",
      "A wider possibility.",
      "Founders, operators, and investors. The right people, brought together with intention.",
    ],
    frontiers: [
      "At the frontier.",
      "Ahead of the obvious.",
      "From intelligence to life sciences. We follow people asking the questions that matter.",
    ],
  }[mode];
  return (
    <section id="network" className="network-section section-shell">
      <div className="section-topline">
        <span className="eyebrow">03 / THE NETWORK</span>
        <span className="micro">PROXIMITY CREATES POSSIBILITY</span>
      </div>
      <div className="network-grid">
        <Reveal className="network-copy">
          <h2>
            {detail[0]}
            <br />
            <em>{detail[1]}</em>
          </h2>
          <p className="body-copy">{detail[2]}</p>
          <div
            className="network-tabs"
            role="tablist"
            aria-label="Explore the network"
          >
            {(["reach", "circles", "frontiers"] as const).map((item, index) => (
              <button
                key={item}
                id={`tab-${item}`}
                role="tab"
                aria-selected={mode === item}
                aria-controls="network-panel"
                tabIndex={mode === item ? 0 : -1}
                onClick={() => setMode(item)}
                onKeyDown={(e) => {
                  const items = ["reach", "circles", "frontiers"] as const;
                  let next = index;
                  if (e.key === "ArrowRight") next = (index + 1) % 3;
                  else if (e.key === "ArrowLeft") next = (index + 2) % 3;
                  else if (e.key === "Home") next = 0;
                  else if (e.key === "End") next = 2;
                  else return;
                  e.preventDefault();
                  setMode(items[next]);
                  document.getElementById(`tab-${items[next]}`)?.focus();
                }}
              >
                <span>0{index + 1}</span>
                {item === "reach"
                  ? "Our reach"
                  : item === "circles"
                    ? "Our circles"
                    : "Our frontiers"}
              </button>
            ))}
          </div>
          <button className="text-link" onClick={() => onConnect("investor")}>
            Find your place in the network <ArrowUpRight size={17} />
          </button>
        </Reveal>
        <div className="network-visual" ref={sceneRef}>
          <div
            id="network-panel"
            role="tabpanel"
            aria-labelledby={`tab-${mode}`}
            className="network-scene"
            tabIndex={0}
          >
            {visible && (
              <Suspense
                fallback={
                  <div className="scene-loading">
                    Mapping possibility
                    <span />
                  </div>
                }
              >
                <SceneBoundary key={mode}>
                  <NetworkScene mode={mode} animated={animate} />
                </SceneBoundary>
              </Suspense>
            )}
          </div>
          <span className="scene-coordinate">42.3601° N &nbsp; 71.0942° W</span>
          <span className="scene-caption">
            {mode === "reach"
              ? "CAMBRIDGE → EVERYWHERE"
              : mode === "circles"
                ? "THE STRENGTH OF CONNECTION"
                : "IDEAS WITHOUT BOUNDARIES"}
          </span>
        </div>
      </div>
    </section>
  );
}

function App() {
  const prefersReduced = useReducedMotion();
  const [motionEnabled, setMotionEnabled] = useState(true);
  const animated = motionEnabled && !prefersReduced;
  const [audience, setAudience] = useState<Audience | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const menuRef = useRef<HTMLDialogElement>(null);
  const privacyRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    const frame = requestAnimationFrame(() =>
      document.getElementById(id)?.scrollIntoView({ behavior: "instant" }),
    );
    return () => cancelAnimationFrame(frame);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.motion = animated ? "on" : "off";
  }, [animated]);
  useEffect(() => {
    if (menuOpen) menuRef.current?.showModal();
    else menuRef.current?.close();
  }, [menuOpen]);
  useEffect(() => {
    if (privacyOpen) privacyRef.current?.showModal();
    else privacyRef.current?.close();
  }, [privacyOpen]);
  useEffect(() => {
    if (!audience && !menuOpen && !privacyOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [audience, menuOpen, privacyOpen]);
  function openIntroduction(role: Audience) {
    setMenuOpen(false);
    setAudience(role);
  }

  return (
    <MotionConfig reducedMotion={animated ? "user" : "always"}>
      <MotionContext.Provider value={!!animated}>
        <SmoothExperience
          enabled={!!animated}
          paused={!!audience || menuOpen || privacyOpen}
        />
        <PointerHalo enabled={!!animated} />
        <ReadingProgress />
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <header className="site-header" id="top">
          <Wordmark />
          <nav className="desktop-nav" aria-label="Main navigation">
            <a href="#thesis">The philosophy</a>
            <a href="#network">The network</a>
            <a href="#approach">Your next chapter</a>
          </nav>
          <button
            className="header-cta"
            onClick={() => openIntroduction("founder")}
          >
            An introduction <ArrowUpRight size={16} />
          </button>
          <button
            className="mobile-menu-button icon-button"
            aria-label="Open navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={23} />
          </button>
        </header>
        <main id="main">
          <section className="hero" aria-labelledby="hero-title">
            <div className="hero-grid" aria-hidden="true" />
            <Ambient className="hero-particles">
              <Particles
                quantity={35}
                color="#d9bd79"
                size={0.35}
                staticity={80}
                ease={90}
              />
            </Ambient>
            <div className="hero-copy">
              <p className="eyebrow hero-eyebrow">
                <span className="tiny-diamond" /> THE INDEPENDENT VENTURE
                NETWORK
              </p>
              <h1 id="hero-title">
                <span>The art of</span>
                <em>
                  <AuroraText colors={golds} speed={0.16}>
                    what’s next.
                  </AuroraText>
                </em>
              </h1>
              <TextAnimate
                className="hero-description"
                animation="fadeIn"
                by="word"
                once
                duration={0.55}
              >
                Exceptional founders. Extraordinary connections. From Cambridge
                to whatever comes next.
              </TextAnimate>
              <div className="hero-actions">
                <button
                  className="gold-button"
                  onClick={() => openIntroduction("founder")}
                >
                  Begin a conversation <ArrowUpRight size={17} />
                </button>
                <a className="text-link" href="#thesis">
                  Discover our world <ArrowDown size={15} />
                </a>
              </div>
            </div>
            <div className="hero-art" data-cursor="Explore">
              <GoldMonolith enabled={!!animated} />
            </div>
            <div className="hero-edition" aria-hidden="true">
              VOL. 01 <span>THE BEGINNING OF SOMETHING</span>
            </div>
            <div className="hero-bottom">
              <a href="#thesis" className="scroll-link">
                <span className="scroll-circle">
                  <ArrowDown size={15} />
                </span>
                SCROLL TO DISCOVER
              </a>
              <span className="hero-location">
                <span className="status-dot" /> CAMBRIDGE ROOTS. GLOBAL
                AMBITION.
              </span>
              <button
                className="motion-toggle"
                onClick={() => setMotionEnabled(!motionEnabled)}
                disabled={!!prefersReduced}
                aria-label={
                  animated ? "Pause ambient motion" : "Enable ambient motion"
                }
              >
                {animated ? <Pause size={12} /> : <Play size={12} />}
                <span>{animated ? "MOTION ON" : "MOTION OFF"}</span>
              </button>
            </div>
          </section>
          <div className="origin-strip">
            <span className="eyebrow">
              EXCEPTIONAL MINDS.
              <br />
              WHEREVER THEY BEGIN.
            </span>
            <div className="origin-name harvard">
              Harvard<span>CAMBRIDGE, MA</span>
            </div>
            <span className="origin-plus">+</span>
            <div className="origin-name mit">
              MIT<span>CAMBRIDGE, MA</span>
            </div>
            <span className="origin-plus">+</span>
            <div className="origin-name beyond">
              & beyond<span>AMBITION HAS NO BOUNDARIES</span>
            </div>
            <ArrowUpRight className="origin-arrow" size={28} strokeWidth={1} />
          </div>
          <section id="thesis" className="thesis-section section-shell">
            <div className="section-topline">
              <span className="eyebrow">01 / THE PHILOSOPHY</span>
              <span className="micro">AMBITION, WITH INTENTION</span>
            </div>
            <div className="thesis-composition">
              <div className="thesis-aside">
                <span className="thesis-number" aria-hidden="true">
                  01
                </span>
                <span className="micro">
                  A SHARED
                  <br />
                  WAY OF SEEING.
                </span>
              </div>
              <div>
                <ScrollTypography enabled={!!animated} />
                <Reveal className="thesis-bottom">
                  <p>
                    We bring remarkable founders into the right rooms. With the
                    people, capital, and conviction to turn a bold beginning
                    into something enduring.
                  </p>
                  <a href="#invitation" className="text-link">
                    The value of an introduction <ArrowDown size={16} />
                  </a>
                </Reveal>
              </div>
            </div>
            <div className="thesis-signature">
              <span>FOUNDER LED.</span>
              <span>RELATIONSHIP DRIVEN.</span>
              <span>OPEN TO THE EXTRAORDINARY.</span>
            </div>
          </section>
          <InvitationStage
            enabled={!!animated}
            onRequest={() => openIntroduction("founder")}
          />
          <Network onConnect={openIntroduction} />
          <section
            className="atelier-section section-shell"
            aria-label="Explore where we find possibility"
          >
            <div className="section-topline">
              <span className="eyebrow">AN OPEN FIELD OF POSSIBILITY</span>
              <span className="micro">FOLLOW YOUR CURIOSITY</span>
            </div>
            <Suspense
              fallback={
                <div className="atelier-loading">A wider perspective.</div>
              }
            >
              <NetworkAtelier enabled={!!animated} />
            </Suspense>
          </section>
          <section id="approach" className="approach-section section-shell">
            <div className="section-topline">
              <span className="eyebrow">04 / YOUR NEXT CHAPTER</span>
              <span className="micro">FEWER DEGREES OF SEPARATION</span>
            </div>
            <Reveal className="approach-heading">
              <h2>
                A meeting of minds.
                <br />
                <em>A world of possibility.</em>
              </h2>
              <p className="body-copy">
                For the people building the future.
                <br />
                And the people who see it first.
              </p>
            </Reveal>
            <div className="audience-grid">
              <Reveal className="audience-card founders-card">
                <div className="card-top">
                  <span className="eyebrow">FOR FOUNDERS</span>
                  <span className="card-index">01</span>
                </div>
                <div className="card-art founder-art">
                  <Lens
                    zoomFactor={1.18}
                    lensSize={160}
                    ariaLabel="Explore the gold connection sculpture"
                  >
                    <GoldSculpture small />
                  </Lens>
                  <span className="art-caption">
                    THE START OF SOMETHING EXCEPTIONAL
                  </span>
                </div>
                <div className="card-bottom">
                  <h3>Build with conviction.</h3>
                  <p>Your ambition. The right introductions.</p>
                  <button
                    aria-label="Connect as a founder"
                    className="circle-link"
                    onClick={() => openIntroduction("founder")}
                  >
                    <ArrowUpRight size={22} strokeWidth={1.2} />
                  </button>
                </div>
                {animated && (
                  <BorderBeam
                    duration={16}
                    size={110}
                    colorFrom="#c9a568"
                    colorTo="#493c20"
                  />
                )}
              </Reveal>
              <Reveal className="audience-card investors-card">
                <div className="card-top">
                  <span className="eyebrow">FOR INVESTORS</span>
                  <span className="card-index">02</span>
                </div>
                <div className="card-art investor-art">
                  <HexagonPattern radius={38} className="hex-pattern" />
                  <div className="opportunity-disc">
                    <span />
                    <span />
                    <span />
                    <i />
                    <div className="disc-center">
                      <Plus size={38} strokeWidth={0.6} />
                    </div>
                  </div>
                  <Ambient>
                    <Floating3DParticles
                      quantity={24}
                      color="#c5a564"
                      size={1.2}
                      drift={0.12}
                      opacity={0.4}
                    />
                  </Ambient>
                  <span className="art-caption">
                    A WINDOW INTO WHAT COMES NEXT
                  </span>
                </div>
                <div className="card-bottom">
                  <h3>See the extraordinary.</h3>
                  <p>Emerging founders. A considered perspective.</p>
                  <button
                    aria-label="Connect as an investor"
                    className="circle-link"
                    onClick={() => openIntroduction("investor")}
                  >
                    <ArrowUpRight size={22} strokeWidth={1.2} />
                  </button>
                </div>
              </Reveal>
            </div>
            <div className="process-line">
              {[
                { title: "Discover", text: "Find the spark." },
                { title: "Connect", text: "Make it personal." },
                { title: "Go further", text: "Open the next door." },
              ].map((step, i) => (
                <Reveal className="process-step" key={step.title}>
                  <span className="step-number">
                    0{animated ? <NumberTicker value={i + 1} /> : i + 1}
                  </span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                  {i < 2 && <ArrowRight size={20} strokeWidth={1} />}
                </Reveal>
              ))}
            </div>
          </section>
          <div
            className="frontier-marquee"
            aria-label="Focus areas: artificial intelligence, life sciences, deep tech, climate, and what comes next"
          >
            <Marquee
              pauseOnHover
              repeat={3}
              className="sector-marquee"
              aria-hidden="true"
            >
              {[
                "Artificial intelligence",
                "Life sciences",
                "Deep tech",
                "Climate",
                "What comes next",
              ].map((item) => (
                <span className="sector-item" key={item}>
                  <span className="tiny-diamond" />
                  {item}
                </span>
              ))}
            </Marquee>
          </div>
          <section id="connect" className="connect-section">
            <Ambient className="connect-meteors">
              <Meteors
                number={3}
                minDuration={12}
                maxDuration={20}
                minDelay={2}
                maxDelay={8}
                className="gold-meteor"
              />
            </Ambient>
            <Reveal>
              <p className="eyebrow">GREAT THINGS BEGIN WITH A CONVERSATION</p>
              <h2>
                Your next chapter.
                <br />
                <em>Our first introduction.</em>
              </h2>
              <InteractiveHoverButton
                className="connect-button"
                onClick={() => openIntroduction("founder")}
              >
                Let’s connect
              </InteractiveHoverButton>
              <div className="community-signature">
                <AvatarCircles avatarUrls={avatarUrls} />
                <span>Founders. Believers. Future builders.</span>
              </div>
            </Reveal>
          </section>
          <div className="monument-word" aria-hidden="true">
            <span>VENTURES</span>
            {animated && (
              <Ambient>
                <VideoText
                  src="/media/gold-flow.mp4"
                  fontFamily="Manrope Variable"
                  fontSize="16vw"
                  fontWeight={500}
                  preload="metadata"
                >
                  VENTURES
                </VideoText>
              </Ambient>
            )}
          </div>
        </main>
        <footer className="site-footer">
          <div className="footer-top">
            <Wordmark footer />
            <span>CONVICTION MEETS POSSIBILITY.</span>
            <a href="#top" className="back-top">
              Back to top <ArrowUpRight size={15} />
            </a>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} ____ Ventures</span>
            <p>
              An independent network. Not affiliated with Harvard University or
              MIT.
            </p>
            <button onClick={() => setPrivacyOpen(true)}>Privacy</button>
          </div>
        </footer>
        <IntroductionDialog
          audience={audience}
          onClose={() => setAudience(null)}
        />
        <dialog
          className="mobile-nav-dialog"
          ref={menuRef}
          aria-label="Navigation"
          onCancel={() => setMenuOpen(false)}
        >
          <div className="mobile-nav-top">
            <Wordmark onNavigate={() => setMenuOpen(false)} />
            <button
              className="icon-button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close navigation"
            >
              <X size={24} />
            </button>
          </div>
          <nav aria-label="Mobile navigation">
            {[
              ["The philosophy", "thesis"],
              ["The network", "network"],
              ["Your next chapter", "approach"],
            ].map(([label, anchor], i) => (
              <a
                key={anchor}
                href={`#${anchor}`}
                onClick={() => setMenuOpen(false)}
              >
                <span>0{i + 1}</span>
                {label}
                <ArrowUpRight size={24} />
              </a>
            ))}
          </nav>
          <button
            className="gold-button"
            onClick={() => openIntroduction("founder")}
          >
            Let’s connect <ArrowUpRight size={17} />
          </button>
          <p className="eyebrow">CAMBRIDGE ROOTS. GLOBAL AMBITION.</p>
        </dialog>
        <dialog
          className="intro-dialog privacy-dialog"
          ref={privacyRef}
          onCancel={() => setPrivacyOpen(false)}
          aria-labelledby="privacy-title"
        >
          <button
            className="dialog-close icon-button"
            aria-label="Close privacy information"
            onClick={() => setPrivacyOpen(false)}
          >
            <X size={20} />
          </button>
          <p className="eyebrow">YOUR PRIVACY</p>
          <h2 id="privacy-title">
            A private
            <br />
            <em>first step.</em>
          </h2>
          <p>
            This website is a design preview. Introduction details are stored
            only in your browser on this device and are not sent to a server. No
            analytics or tracking cookies are used.
          </p>
          <p>
            You can delete your saved introduction below, or clear this site’s
            browser data.
          </p>
          <button
            className="gold-button"
            onClick={(e) => {
              try {
                localStorage.removeItem("ventures-introduction");
                e.currentTarget.textContent = "Saved introduction deleted";
              } catch {
                e.currentTarget.textContent =
                  "Please clear this site’s browser data";
              }
            }}
          >
            Delete saved introduction
          </button>
        </dialog>
      </MotionContext.Provider>
    </MotionConfig>
  );
}
export default App;
