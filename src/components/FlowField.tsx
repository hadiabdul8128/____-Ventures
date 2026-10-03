import { useEffect, useRef } from "react";

/**
 * Hero background: a magnetic flow field. Particles ride a slowly evolving
 * curl-noise field and leave luminous trails; the pointer is a vortex that
 * drags the field with it, and a click/tap bursts a short-lived swarm into it.
 */

// Particle layout in one Float32Array: x, y, impulseX, impulseY, life, maxLife, gain
const STRIDE = 7;
const BURST_SLOTS = 720;
const BURST_SIZE = 120;
const ALPHA_BUCKETS = 12;

const FIELD_SPEED = 95; // px/s at curl magnitude 1
const SPEED_REF = 230; // speed that maps to full brightness
const TAIL = 2.4; // streak length as a multiple of per-frame displacement
const TRAIL_FADE = 0.13; // per-frame black fill alpha (~0.5s persistence)
const VORTEX_RADIUS = 260;
const VORTEX_SPIN = 420; // tangential px/s at the core
const VORTEX_PULL = 90; // inward px/s at the core
const VORTEX_DRAG = 0.55; // fraction of pointer velocity passed to the field

type Noise = (x: number, y: number) => { v: number; dx: number; dy: number };

// Gradient noise with analytic partial derivatives, so the curl of one octave
// costs a single evaluation instead of four finite-difference samples.
function makeNoise(seed: number): Noise {
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  let s = seed >>> 0 || 1;
  const rand = () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const t = p[i];
    p[i] = p[j];
    p[j] = t;
  }
  const perm = new Uint8Array(512);
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  const GX = new Float32Array(8);
  const GY = new Float32Array(8);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.3;
    GX[i] = Math.cos(a);
    GY[i] = Math.sin(a);
  }
  const out = { v: 0, dx: 0, dy: 0 };

  return (x, y) => {
    const X = Math.floor(x);
    const Y = Math.floor(y);
    const fx = x - X;
    const fy = y - Y;
    const xi = X & 255;
    const yi = Y & 255;
    const u = fx * fx * fx * (fx * (fx * 6 - 15) + 10);
    const v = fy * fy * fy * (fy * (fy * 6 - 15) + 10);
    const du = 30 * fx * fx * (fx * (fx - 2) + 1);
    const dv = 30 * fy * fy * (fy * (fy - 2) + 1);
    const a = perm[xi] + yi;
    const b = perm[xi + 1] + yi;
    const i00 = perm[a] & 7;
    const i01 = perm[a + 1] & 7;
    const i10 = perm[b] & 7;
    const i11 = perm[b + 1] & 7;
    const g00x = GX[i00];
    const g00y = GY[i00];
    const g10x = GX[i10];
    const g10y = GY[i10];
    const g01x = GX[i01];
    const g01y = GY[i01];
    const g11x = GX[i11];
    const g11y = GY[i11];
    const n00 = g00x * fx + g00y * fy;
    const n10 = g10x * (fx - 1) + g10y * fy;
    const n01 = g01x * fx + g01y * (fy - 1);
    const n11 = g11x * (fx - 1) + g11y * (fy - 1);
    const k1 = n10 - n00;
    const k2 = n01 - n00;
    const k3 = n00 - n10 - n01 + n11;
    const uv = u * v;
    out.v = n00 + k1 * u + k2 * v + k3 * uv;
    out.dx =
      g00x +
      (g10x - g00x) * u +
      (g01x - g00x) * v +
      (g00x - g10x - g01x + g11x) * uv +
      du * (k1 + k3 * v);
    out.dy =
      g00y +
      (g10y - g00y) * u +
      (g01y - g00y) * v +
      (g00y - g10y - g01y + g11y) * uv +
      dv * (k2 + k3 * u);
    return out;
  };
}

export function FlowField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const noise = makeNoise(0x9e3779b9);
    const pointer = { x: -9999, y: -9999, vx: 0, vy: 0, t: 0, active: false };
    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;
    let last = 0;
    let elapsed = 0;
    let baseCount = 0;
    let P = new Float32Array(0);
    let bucket = new Uint8Array(0);
    let burstCursor = 0;

    const spawn = (o: number) => {
      P[o] = Math.random() * width;
      P[o + 1] = Math.random() * height;
      P[o + 2] = 0;
      P[o + 3] = 0;
      P[o + 4] = P[o + 5] = 3 + Math.random() * 6;
      P[o + 6] = 0.7 + Math.random() * 0.6;
    };

    const allocate = () => {
      const next = width < 640 ? 500 : 1400;
      if (next === baseCount && P.length) return;
      baseCount = next;
      P = new Float32Array((baseCount + BURST_SLOTS) * STRIDE);
      bucket = new Uint8Array(baseCount + BURST_SLOTS);
      for (let i = 0; i < baseCount; i++) {
        spawn(i * STRIDE);
        // Stagger ages so the pool doesn't respawn in lockstep.
        P[i * STRIDE + 4] *= Math.random();
      }
    };

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
      ctx.lineCap = "round";
      allocate();
    };

    const toLocal = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const onMove = (e: PointerEvent) => {
      const p = toLocal(e.clientX, e.clientY);
      const now = performance.now();
      const dt = (now - pointer.t) / 1000;
      if (pointer.active && dt > 0 && dt < 0.2) {
        const vx = (p.x - pointer.x) / dt;
        const vy = (p.y - pointer.y) / dt;
        const mag = Math.hypot(vx, vy);
        const clamp = mag > 1800 ? 1800 / mag : 1;
        pointer.vx = pointer.vx * 0.5 + vx * clamp * 0.5;
        pointer.vy = pointer.vy * 0.5 + vy * clamp * 0.5;
      }
      pointer.x = p.x;
      pointer.y = p.y;
      pointer.t = now;
      pointer.active = p.x >= 0 && p.y >= 0 && p.x <= width && p.y <= height;
    };
    const onLeave = () => {
      pointer.active = false;
      pointer.vx = pointer.vy = 0;
    };
    // `pointerleave` never reaches window; `pointerout` with no relatedTarget
    // means the pointer left the viewport. Touch/pen have no hover, so the
    // vortex only lives while the contact is down.
    const onOut = (e: PointerEvent) => {
      if (!e.relatedTarget || e.pointerType !== "mouse") onLeave();
    };
    const burst = (x: number, y: number) => {
      for (let n = 0; n < BURST_SIZE; n++) {
        const i = baseCount + (burstCursor++ % BURST_SLOTS);
        const o = i * STRIDE;
        const ang = Math.random() * Math.PI * 2;
        const speed = 140 + Math.random() * 380;
        P[o] = x;
        P[o + 1] = y;
        P[o + 2] = Math.cos(ang) * speed;
        P[o + 3] = Math.sin(ang) * speed;
        P[o + 4] = P[o + 5] = 0.9 + Math.random() * 1.1;
        P[o + 6] = 1 + Math.random() * 0.5;
      }
    };
    const onDown = (e: PointerEvent) => {
      const p = toLocal(e.clientX, e.clientY);
      if (p.x < 0 || p.y < 0 || p.x > width || p.y > height) return;
      pointer.x = p.x;
      pointer.y = p.y;
      pointer.t = performance.now();
      pointer.active = true;
      burst(p.x, p.y);
    };

    const step = (dt: number) => {
      const t = elapsed;
      const total = baseCount + BURST_SLOTS;
      const px = pointer.x;
      const py = pointer.y;
      const pvx = pointer.vx;
      const pvy = pointer.vy;
      const vortex = pointer.active;
      const r2 = VORTEX_RADIUS * VORTEX_RADIUS;
      const damp = Math.max(0, 1 - 3.2 * dt);
      const s1 = 1 / 380;
      const s2 = 1 / 150;
      const o1x = t * 0.05;
      const o1y = -t * 0.025;
      const o2x = 41.3 - t * 0.035;
      const o2y = 17.9 + t * 0.06;

      for (let i = 0; i < total; i++) {
        const o = i * STRIDE;
        const life = P[o + 4] - dt;
        if (life <= 0) {
          if (i < baseCount) spawn(o);
          else bucket[i] = 0;
          continue;
        }
        let x = P[o];
        let y = P[o + 1];

        // Curl of a two-octave potential: rotate the gradient by 90°.
        let n = noise(x * s1 + o1x, y * s1 + o1y);
        let gx = n.dx;
        let gy = n.dy;
        n = noise(x * s2 + o2x, y * s2 + o2y);
        gx += n.dx * 0.45;
        gy += n.dy * 0.45;
        const gain = FIELD_SPEED * P[o + 6];
        let vx = gy * gain + P[o + 2];
        let vy = -gx * gain + P[o + 3];
        P[o + 2] *= damp;
        P[o + 3] *= damp;

        let bright = 0;
        if (vortex) {
          const ddx = x - px;
          const ddy = y - py;
          const d2 = ddx * ddx + ddy * ddy;
          if (d2 < r2) {
            const d = Math.sqrt(d2);
            let k = 1 - d / VORTEX_RADIUS;
            k = k * k * (3 - 2 * k);
            const inv = k / (d + 10);
            vx += (-ddy * VORTEX_SPIN - ddx * VORTEX_PULL) * inv + pvx * VORTEX_DRAG * k;
            vy += (ddx * VORTEX_SPIN - ddy * VORTEX_PULL) * inv + pvy * VORTEX_DRAG * k;
            bright = k;
          }
        }

        x += vx * dt;
        y += vy * dt;
        if (x < -6 || y < -6 || x > width + 6 || y > height + 6) {
          if (i < baseCount) spawn(o);
          else P[o + 4] = 0;
          bucket[i] = 0;
          continue;
        }
        P[o] = x;
        P[o + 1] = y;
        P[o + 4] = life;

        const speed = Math.sqrt(vx * vx + vy * vy);
        let a = 0.25 + Math.min(1, speed / SPEED_REF) * 0.65 + bright * 0.35;
        const maxLife = P[o + 5];
        const env =
          i < baseCount
            ? Math.min(1, life / 0.5, (maxLife - life) / 0.5)
            : Math.min(1, life / 0.4);
        a = Math.min(1, a) * env;
        bucket[i] = Math.min(ALPHA_BUCKETS - 1, (a * ALPHA_BUCKETS) | 0);
      }

      // Decay pointer momentum so a stopped mouse stops dragging.
      pointer.vx *= 0.82;
      pointer.vy *= 0.82;
    };

    const draw = (dt: number) => {
      ctx.globalAlpha = 1;
      ctx.fillStyle = `rgba(0,0,0,${TRAIL_FADE})`;
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = "#f4f4f2";
      ctx.lineWidth = 1.3;
      const total = baseCount + BURST_SLOTS;
      const tail = -TAIL * dt;
      // One path per alpha bucket keeps draw calls ~constant regardless of N.
      for (let b = 1; b < ALPHA_BUCKETS; b++) {
        ctx.globalAlpha = (b + 0.5) / ALPHA_BUCKETS;
        ctx.beginPath();
        for (let i = 0; i < total; i++) {
          if (bucket[i] !== b) continue;
          const o = i * STRIDE;
          const x = P[o];
          const y = P[o + 1];
          // Velocity is recoverable from the field + impulse, but reusing the
          // just-computed displacement is cheaper: approximate via impulse-free
          // tail along the direction we moved this frame.
          const tx = x + (x - P[o]) * tail;
          ctx.moveTo(x, y);
          ctx.lineTo(tx, y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!last) last = now;
      const dt = Math.min(0.05, (now - last) / 1000) || 1 / 60;
      last = now;
      elapsed += dt;
      step(dt);
      draw(dt);
    };

    resize();
    const io = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(raf);
      last = 0;
      if (entry.isIntersecting) raf = requestAnimationFrame(loop);
    });
    io.observe(canvas);
    const ro = new ResizeObserver(resize);
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
