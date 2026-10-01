"use client";

import { type ReactNode, useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type Point = {
  x: number;
  y: number;
};

type Ripple = Point & {
  born: number;
};

type GridTone = "neutral" | "allow" | "block";

type KineticGridProps = {
  children?: ReactNode;
  className?: string;
  tone?: GridTone;
  autoActivate?: boolean;
  rippleOnPointerDown?: boolean;
};

const CELL_SIZE = 56;
const DOT_SPACING = 28;
const INFLUENCE_RADIUS = 220;
const MAX_WARP = 18;
const LERP_SPEED = 0.11;
const RIPPLE_LIFETIME = 1250;

const ACTIVE_COLORS: Record<GridTone, { r: number; g: number; b: number }> = {
  neutral: { r: 184, g: 167, b: 232 },
  allow: { r: 139, g: 231, b: 165 },
  block: { r: 255, g: 148, b: 166 },
};

function lerp(start: number, end: number, amount: number) {
  return start + (end - start) * amount;
}

function rgba(color: { r: number; g: number; b: number }, alpha: number) {
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
}

export default function KineticGrid({
  children,
  className,
  tone = "neutral",
  autoActivate = false,
  rippleOnPointerDown = true,
}: KineticGridProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerRef = useRef<Point>({ x: -9999, y: -9999 });
  const targetPointerRef = useRef<Point>({ x: -9999, y: -9999 });
  const ripplesRef = useRef<Ripple[]>([]);
  const pointerInsideRef = useRef(false);
  const frameRef = useRef(0);
  const toneRef = useRef(tone);
  const sizeRef = useRef({ width: 0, height: 0, dpr: 1 });

  toneRef.current = tone;

  const warpedPoint = useCallback(
    (x: number, y: number, column: number, row: number, columns: number, rows: number, now: number) => {
      const edgeMargin = 1.5;
      const columnPin = Math.min(column / edgeMargin, (columns - 1 - column) / edgeMargin, 1);
      const rowPin = Math.min(row / edgeMargin, (rows - 1 - row) / edgeMargin, 1);
      const pin = Math.max(0, columnPin * columnPin * rowPin * rowPin);
      const pointer = pointerRef.current;
      const dx = x - pointer.x;
      const dy = y - pointer.y;
      const distance = Math.hypot(dx, dy);
      const proximity = Math.max(0, 1 - distance / INFLUENCE_RADIUS) * pin;
      let rippleX = 0;
      let rippleY = 0;

      for (const ripple of ripplesRef.current) {
        const age = Math.max(0, Math.min(1, (now - ripple.born) / RIPPLE_LIFETIME));
        const radius = age * Math.max(sizeRef.current.width, sizeRef.current.height) * 0.72;
        const rippleDx = x - ripple.x;
        const rippleDy = y - ripple.y;
        const rippleDistance = Math.hypot(rippleDx, rippleDy);
        const difference = rippleDistance - radius;
        const waveWidth = 52;

        if (Math.abs(difference) < waveWidth && rippleDistance > 0) {
          const strength = (1 - Math.abs(difference) / waveWidth) * (1 - age) * 20 * pin;
          rippleX += (rippleDx / rippleDistance) * strength;
          rippleY += (rippleDy / rippleDistance) * strength;
        }
      }

      if (distance >= INFLUENCE_RADIUS || distance === 0 || pin === 0) {
        return { x: x + rippleX, y: y + rippleY, proximity };
      }

      const falloff = Math.pow(1 - distance / INFLUENCE_RADIUS, 2) * Math.min(1, distance / 44);
      const warp = falloff * MAX_WARP * pin;

      return {
        x: x - (dx / distance) * warp + rippleX,
        y: y - (dy / distance) * warp + rippleY,
        proximity,
      };
    },
    [],
  );

  const draw = useCallback(
    (now: number, staticOnly = false) => {
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");
      const { width, height, dpr } = sizeRef.current;

      if (!canvas || !context || width === 0 || height === 0) return;

      if (!staticOnly) {
        pointerRef.current.x = lerp(pointerRef.current.x, targetPointerRef.current.x, LERP_SPEED);
        pointerRef.current.y = lerp(pointerRef.current.y, targetPointerRef.current.y, LERP_SPEED);
      }

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);

      const activeColor = ACTIVE_COLORS[toneRef.current];

      if (pointerRef.current.x > -1000) {
        const highlight = context.createRadialGradient(
          pointerRef.current.x,
          pointerRef.current.y,
          0,
          pointerRef.current.x,
          pointerRef.current.y,
          INFLUENCE_RADIUS * 1.15,
        );
        highlight.addColorStop(0, rgba(activeColor, 0.17));
        highlight.addColorStop(0.42, rgba(activeColor, 0.075));
        highlight.addColorStop(1, rgba(activeColor, 0));
        context.fillStyle = highlight;
        context.fillRect(0, 0, width, height);
      }

      context.fillStyle = "rgba(221, 212, 247, 0.055)";
      for (let x = DOT_SPACING / 2; x < width; x += DOT_SPACING) {
        for (let y = DOT_SPACING / 2; y < height; y += DOT_SPACING) {
          context.beginPath();
          context.arc(x, y, 0.75, 0, Math.PI * 2);
          context.fill();
        }
      }

      const columns = Math.ceil(width / CELL_SIZE) + 2;
      const rows = Math.ceil(height / CELL_SIZE) + 2;
      const startX = (width - (columns - 1) * CELL_SIZE) / 2;
      const startY = (height - (rows - 1) * CELL_SIZE) / 2;
      const points: Array<Array<ReturnType<typeof warpedPoint>>> = [];

      for (let row = 0; row < rows; row += 1) {
        points[row] = [];
        for (let column = 0; column < columns; column += 1) {
          points[row][column] = warpedPoint(
            startX + column * CELL_SIZE,
            startY + row * CELL_SIZE,
            column,
            row,
            columns,
            rows,
            staticOnly ? 0 : now,
          );
        }
      }

      context.lineWidth = 1;
      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns - 1; column += 1) {
          const current = points[row][column];
          const next = points[row][column + 1];
          const intensity = Math.max(current.proximity, next.proximity);
          context.strokeStyle = rgba(activeColor, 0.1 + intensity * 0.46);
          context.beginPath();
          context.moveTo(current.x, current.y);
          context.lineTo(next.x, next.y);
          context.stroke();
        }
      }

      for (let column = 0; column < columns; column += 1) {
        for (let row = 0; row < rows - 1; row += 1) {
          const current = points[row][column];
          const next = points[row + 1][column];
          const intensity = Math.max(current.proximity, next.proximity);
          context.strokeStyle = rgba(activeColor, 0.1 + intensity * 0.46);
          context.beginPath();
          context.moveTo(current.x, current.y);
          context.lineTo(next.x, next.y);
          context.stroke();
        }
      }

      for (const row of points) {
        for (const point of row) {
          context.fillStyle = rgba(activeColor, 0.22 + point.proximity * 0.72);
          context.beginPath();
          context.arc(point.x, point.y, 1.15 + point.proximity * 1.8, 0, Math.PI * 2);
          context.fill();
        }
      }

      if (!staticOnly) {
        ripplesRef.current = ripplesRef.current.filter((ripple) => now - ripple.born < RIPPLE_LIFETIME);
        for (const ripple of ripplesRef.current) {
          const age = Math.max(0, Math.min(1, (now - ripple.born) / RIPPLE_LIFETIME));
          const radius = age * Math.max(width, height) * 0.72;
          context.strokeStyle = rgba(activeColor, (1 - age) * 0.3);
          context.lineWidth = 1.25;
          context.beginPath();
          context.arc(ripple.x, ripple.y, radius, 0, Math.PI * 2);
          context.stroke();
        }
      }
    },
    [warpedPoint],
  );

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const motionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce), (max-width: 760px), (max-width: 900px) and (max-height: 600px), (hover: none), (pointer: coarse)",
    );
    let visible = false;
    let wasVisible = false;
    let lastAmbientRipple = 0;

    const resize = () => {
      const rect = root.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      sizeRef.current = { width, height, dpr };
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      draw(performance.now(), motionQuery.matches);
    };

    const frame = (now: number) => {
      if (!visible || motionQuery.matches) {
        frameRef.current = 0;
        return;
      }

      if (autoActivate && !pointerInsideRef.current) {
        const { width, height } = sizeRef.current;
        targetPointerRef.current = {
          x: width * (0.5 + Math.sin(now * 0.00042) * 0.3),
          y: height * (0.5 + Math.cos(now * 0.00031) * 0.22),
        };

        if (now - lastAmbientRipple > 2100) {
          ripplesRef.current.push({ ...targetPointerRef.current, born: now });
          lastAmbientRipple = now;
        }
      }

      draw(now);
      frameRef.current = window.requestAnimationFrame(frame);
    };

    const start = () => {
      if (visible && !motionQuery.matches && frameRef.current === 0) {
        frameRef.current = window.requestAnimationFrame(frame);
      }
    };

    const positionFromEvent = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointerInsideRef.current = true;
      targetPointerRef.current = positionFromEvent(event);
    };

    const handlePointerLeave = () => {
      pointerInsideRef.current = false;
      if (!autoActivate) targetPointerRef.current = { x: -9999, y: -9999 };
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (!rippleOnPointerDown || !event.isPrimary || motionQuery.matches) return;
      const point = positionFromEvent(event);
      targetPointerRef.current = point;
      pointerRef.current = point;
      ripplesRef.current.push({ ...point, born: performance.now() });
    };

    const handleMotionPreference = () => {
      if (motionQuery.matches) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = 0;
        targetPointerRef.current = { x: -9999, y: -9999 };
        pointerRef.current = { x: -9999, y: -9999 };
        ripplesRef.current = [];
        draw(performance.now(), true);
      } else {
        start();
      }
    };

    const resizeObserver = new ResizeObserver(resize);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !wasVisible && autoActivate && !motionQuery.matches) {
        const point = {
          x: sizeRef.current.width * 0.5,
          y: sizeRef.current.height * 0.54,
        };
        pointerRef.current = point;
        targetPointerRef.current = point;
        ripplesRef.current.push({ ...point, born: performance.now() });
        lastAmbientRipple = performance.now();
      }
      wasVisible = visible;
      if (visible) start();
    });

    resizeObserver.observe(root);
    intersectionObserver.observe(root);
    root.addEventListener("pointermove", handlePointerMove, { passive: true });
    root.addEventListener("pointerleave", handlePointerLeave, { passive: true });
    root.addEventListener("pointerdown", handlePointerDown, { passive: true });
    motionQuery.addEventListener("change", handleMotionPreference);
    resize();
    start();

    return () => {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      root.removeEventListener("pointermove", handlePointerMove);
      root.removeEventListener("pointerleave", handlePointerLeave);
      root.removeEventListener("pointerdown", handlePointerDown);
      motionQuery.removeEventListener("change", handleMotionPreference);
    };
  }, [autoActivate, draw, rippleOnPointerDown]);

  return (
    <div ref={rootRef} className={cn("h-full w-full overflow-hidden", className)} style={{ touchAction: "pan-y" }}>
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-0 h-full w-full" aria-hidden="true" />
      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
}
