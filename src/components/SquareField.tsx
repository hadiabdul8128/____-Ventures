import { useEffect, useRef } from "react";

/**
 * Interactive background: a lattice of small squares that wake up around the
 * pointer, lean away from it, and ripple outward on click/tap. Idle, a slow
 * wave keeps the field breathing so it never reads as static.
 */
export function SquareField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const STEP = 30;
    const BASE = 1.6;
    const RADIUS = 190;
    const pointer = { x: -9999, y: -9999, active: false };
    const ripples: { x: number; y: number; t: number }[] = [];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;
    let start = performance.now();

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      width = Math.ceil(rect?.width ?? window.innerWidth);
      height = Math.ceil(rect?.height ?? window.innerHeight);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const toLocal = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const onMove = (e: PointerEvent) => {
      const p = toLocal(e.clientX, e.clientY);
      pointer.x = p.x;
      pointer.y = p.y;
      pointer.active = p.x >= 0 && p.y >= 0 && p.x <= width && p.y <= height;
    };
    const onLeave = () => {
      pointer.active = false;
    };
    // `pointerleave` never reaches window; `pointerout` with no relatedTarget
    // means the pointer left the viewport. Touch/pen have no hover, so drop
    // the highlight as soon as the contact lifts.
    const onOut = (e: PointerEvent) => {
      if (!e.relatedTarget || e.pointerType !== "mouse") onLeave();
    };
    const onDown = (e: PointerEvent) => {
      const p = toLocal(e.clientX, e.clientY);
      if (p.x < 0 || p.y < 0 || p.x > width || p.y > height) return;
      ripples.push({ x: p.x, y: p.y, t: performance.now() });
      if (ripples.length > 6) ripples.shift();
    };

    const draw = (now: number) => {
      const t = (now - start) / 1000;
      ctx.clearRect(0, 0, width, height);
      const cols = Math.ceil(width / STEP) + 1;
      const rows = Math.ceil(height / STEP) + 1;
      const offX = (width - (cols - 1) * STEP) / 2;
      const offY = (height - (rows - 1) * STEP) / 2;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const gx = offX + i * STEP;
          const gy = offY + j * STEP;

          // idle wave
          const wave = 0.5 + 0.5 * Math.sin(t * 0.8 + gx * 0.012 + gy * 0.009);
          let energy = 0.06 + wave * 0.08;
          let dx = 0;
          let dy = 0;

          // pointer proximity
          if (pointer.active) {
            const ddx = gx - pointer.x;
            const ddy = gy - pointer.y;
            const d = Math.hypot(ddx, ddy);
            if (d < RADIUS) {
              const k = 1 - d / RADIUS;
              const ease = k * k * (3 - 2 * k);
              energy += ease * 0.95;
              const push = ease * 10;
              dx += (ddx / (d || 1)) * push;
              dy += (ddy / (d || 1)) * push;
            }
          }

          // ripples
          for (const r of ripples) {
            const age = (now - r.t) / 1000;
            const front = age * 520;
            const d = Math.hypot(gx - r.x, gy - r.y);
            const band = Math.abs(d - front);
            if (band < 70 && age < 2.2) {
              const k = (1 - band / 70) * Math.max(0, 1 - age / 2.2);
              energy += k * 0.9;
              dx += ((gx - r.x) / (d || 1)) * k * 6;
              dy += ((gy - r.y) / (d || 1)) * k * 6;
            }
          }

          energy = Math.min(energy, 1);
          const size = BASE + energy * 7;
          ctx.globalAlpha = 0.12 + energy * 0.88;
          ctx.fillRect(gx + dx - size / 2, gy + dy - size / 2, size, size);
        }
      }
      ctx.globalAlpha = 1;

      while (ripples.length && now - ripples[0].t > 2300) ripples.shift();
    };

    const loop = (now: number) => {
      draw(now);
      raf = requestAnimationFrame(loop);
    };

    resize();
    ctx.fillStyle = "#f4f4f2";
    start = performance.now();
    raf = requestAnimationFrame(loop);
    // Only animate while the hero is on screen; on a long page that's a
    // minority of the session.
    const io = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(raf);
      if (entry.isIntersecting) raf = requestAnimationFrame(loop);
    });
    io.observe(canvas);
    const ro = new ResizeObserver(() => {
      resize();
      ctx.fillStyle = "#f4f4f2";
    });
    if (canvas.parentElement) ro.observe(canvas.parentElement);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerout", onOut, { passive: true });
    window.addEventListener("pointerup", onOut, { passive: true });
    window.addEventListener("pointercancel", onOut, { passive: true });
    window.addEventListener("blur", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerout", onOut);
      window.removeEventListener("pointerup", onOut);
      window.removeEventListener("pointercancel", onOut);
      window.removeEventListener("blur", onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
