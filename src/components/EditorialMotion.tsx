import { useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

async function importMotion() {
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([
    import("gsap"),
    import("gsap/ScrollTrigger"),
  ]);
  gsap.registerPlugin(ScrollTrigger);
  return { gsap, ScrollTrigger };
}

let motionModules: ReturnType<typeof importMotion> | undefined;
function loadMotion() {
  return (motionModules ??= importMotion());
}

/** Boov's shared GSAP/Lenis clock, adapted for native dialogs and live motion controls. */
export function SmoothExperience({
  enabled,
  paused,
}: {
  enabled: boolean;
  paused: boolean;
}) {
  const pausedRef = useRef(paused);
  const refreshClock = useRef<(() => void) | null>(null);

  useEffect(() => {
    pausedRef.current = paused;
    refreshClock.current?.();
  }, [paused]);

  useEffect(() => {
    if (!enabled) return;
    const desktop = window.matchMedia(
      "(min-width: 901px) and (hover: hover) and (pointer: fine)",
    );
    let disposed = false;
    let generation = 0;
    let cleanup: (() => void) | undefined;

    function configure() {
      const current = ++generation;
      cleanup?.();
      cleanup = undefined;
      if (!desktop.matches) return;

      void loadMotion()
        .then(({ gsap, ScrollTrigger }) => {
          if (disposed || current !== generation || !desktop.matches) return;
          const lenis = new Lenis({
            duration: 0.95,
            smoothWheel: true,
            anchors: true,
            prevent: (node) => node.closest("dialog") !== null,
          });
          lenis.on("scroll", ScrollTrigger.update);
          const tick = (time: number) => lenis.raf(time * 1000);
          let clockAttached = false;
          const syncClock = () => {
            const running = !pausedRef.current && !document.hidden;
            if (running) lenis.start();
            else lenis.stop();
            if (running && !clockAttached) {
              gsap.ticker.add(tick);
              clockAttached = true;
            } else if (!running && clockAttached) {
              gsap.ticker.remove(tick);
              clockAttached = false;
            }
          };
          refreshClock.current = syncClock;
          document.addEventListener("visibilitychange", syncClock);
          syncClock();
          cleanup = () => {
            document.removeEventListener("visibilitychange", syncClock);
            gsap.ticker.remove(tick);
            lenis.destroy();
            if (refreshClock.current === syncClock) refreshClock.current = null;
          };
        })
        .catch(() => {
          // Native scrolling remains available if the optional motion chunk fails.
        });
    }

    configure();
    desktop.addEventListener("change", configure);
    return () => {
      disposed = true;
      cleanup?.();
      desktop.removeEventListener("change", configure);
    };
  }, [enabled]);
  return null;
}

/** Selectable editorial typography; no content is hidden by the scroll treatment. */
export function ScrollTypography({ enabled }: { enabled: boolean }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const heading = ref.current;
    if (!enabled || !heading) return;
    let disposed = false;
    let cleanup: (() => void) | undefined;
    void loadMotion()
      .then(({ gsap }) => {
        if (disposed) return;
        const context = gsap.context(() => {
          gsap.fromTo(
            ".thesis-word",
            { opacity: 0.32 },
            {
              opacity: 1,
              stagger: 0.2,
              ease: "none",
              scrollTrigger: {
                trigger: heading,
                start: "top 86%",
                end: "bottom 46%",
                scrub: 0.6,
              },
            },
          );
        }, heading);
        cleanup = () => context.revert();
      })
      .catch(() => {
        // The complete statement is visible without the scroll treatment.
      });
    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [enabled]);
  return (
    <h2 ref={ref} className="editorial-statement">
      <span className="statement-line">
        {"We see the world".split(" ").map((word, i) => (
          <span className="thesis-word" key={i}>
            {word}{" "}
          </span>
        ))}
      </span>
      <span className="statement-line">
        {"a little differently.".split(" ").map((word, i) => (
          <span className="thesis-word" key={i}>
            {word}{" "}
          </span>
        ))}
      </span>
      <em className="statement-line">
        {"So do you.".split(" ").map((word, i) => (
          <span className="thesis-word" key={i}>
            {word}{" "}
          </span>
        ))}
      </em>
    </h2>
  );
}

/** A soft pointer halo, derived from Boov's cursor without replacing the native cursor. */
export function PointerHalo({ enabled }: { enabled: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const halo = ref.current;
    if (!enabled || !halo) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    let disposed = false;
    let generation = 0;
    let cleanup: (() => void) | undefined;
    const hide = () => {
      halo.style.opacity = "0";
    };

    const configure = () => {
      const current = ++generation;
      cleanup?.();
      cleanup = undefined;
      hide();
      if (!fine.matches) return;
      void loadMotion()
        .then(({ gsap }) => {
          if (disposed || current !== generation || !fine.matches) return;
          const context = gsap.context(() => {
            const x = gsap.quickTo(halo, "x", {
              duration: 0.32,
              ease: "power3.out",
            });
            const y = gsap.quickTo(halo, "y", {
              duration: 0.32,
              ease: "power3.out",
            });
            const move = (event: PointerEvent) => {
              if (
                !fine.matches ||
                document.hidden ||
                event.pointerType !== "mouse"
              )
                return;
              x(event.clientX);
              y(event.clientY);
              halo.style.opacity = "1";
              const link = (event.target as Element)?.closest?.(
                "a,button,[data-cursor]",
              );
              halo.dataset.hover = link ? "true" : "false";
            };
            window.addEventListener("pointermove", move, { passive: true });
            return () => window.removeEventListener("pointermove", move);
          });
          cleanup = () => context.revert();
        })
        .catch(hide);
    };

    configure();
    fine.addEventListener("change", configure);
    document.documentElement.addEventListener("pointerleave", hide);
    document.addEventListener("visibilitychange", hide);
    window.addEventListener("blur", hide);
    return () => {
      disposed = true;
      cleanup?.();
      fine.removeEventListener("change", configure);
      document.documentElement.removeEventListener("pointerleave", hide);
      document.removeEventListener("visibilitychange", hide);
      window.removeEventListener("blur", hide);
      hide();
    };
  }, [enabled]);
  return enabled ? (
    <div className="pointer-halo" ref={ref} aria-hidden="true">
      <span />
    </div>
  ) : null;
}

export function ReadingProgress() {
  const ref = useRef<HTMLDivElement>(null);
  const [chapter, setChapter] = useState("01");
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress =
        max > 0 ? Math.max(0, Math.min(1, window.scrollY / max)) : 0;
      if (ref.current) ref.current.style.transform = `scaleX(${progress})`;
      const sections = [
        "main",
        "thesis",
        "invitation",
        "network",
        "approach",
        "connect",
      ];
      let active = 0;
      sections.forEach((id, index) => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.48)
          active = index;
      });
      setChapter(String(active + 1).padStart(2, "0"));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    update();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);
  return (
    <>
      <div className="reading-progress" ref={ref} aria-hidden="true" />
      <span className="chapter-indicator" aria-hidden="true">
        {chapter}
        <i />
        06
      </span>
    </>
  );
}
