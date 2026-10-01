"use client";

import {
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
} from "react";
import { cn } from "@/lib/utils";

type Point = {
  x: number;
  y: number;
};

type Dot = Point & {
  homeX: number;
  homeY: number;
  velocityX: number;
  velocityY: number;
  activity: number;
};

export interface InteractiveGridProps extends ComponentPropsWithoutRef<"div"> {
  text?: string;
  dotSize?: number;
  gap?: number;
  baseColor?: string;
  activeColor?: string;
  proximity?: number;
  speedTrigger?: number;
  maxSpeed?: number;
  shockRadius?: number;
  shockStrength?: number;
  resistance?: number;
  returnDuration?: number;
  active?: boolean;
  reducedMotion?: boolean;
  localizedReveal?: boolean;
  revealRadius?: number;
  revealFeather?: number;
  children?: ReactNode;
}

const DEFAULT_BASE_COLOR = "#b8a7e8";
const DEFAULT_ACTIVE_COLOR = "#fff8f2";

function parseHexColor(color: string) {
  const normalized = color.trim().replace("#", "");
  if (!/^[\da-f]{3}([\da-f]{3})?$/i.test(normalized)) {
    return { red: 184, green: 167, blue: 232 };
  }

  const value = normalized.length === 3
    ? normalized.split("").map((character) => character + character).join("")
    : normalized;

  return {
    red: Number.parseInt(value.slice(0, 2), 16),
    green: Number.parseInt(value.slice(2, 4), 16),
    blue: Number.parseInt(value.slice(4, 6), 16),
  };
}

function mixColor(from: ReturnType<typeof parseHexColor>, to: ReturnType<typeof parseHexColor>, amount: number) {
  const progress = Math.max(0, Math.min(1, amount));
  const channel = (start: number, end: number) => Math.round(start + (end - start) * progress);

  return `rgb(${channel(from.red, to.red)}, ${channel(from.green, to.green)}, ${channel(from.blue, to.blue)})`;
}

/**
 * A pointer-reactive dot grid clipped to real text glyphs. Canvas keeps the
 * large hero wordmark responsive without creating hundreds of animated DOM
 * nodes, while retaining the supplied grid's proximity and shock behavior.
 */
export default function InteractiveGrid({
  text = "BOOV",
  dotSize = 7,
  gap = 10,
  baseColor = DEFAULT_BASE_COLOR,
  activeColor = DEFAULT_ACTIVE_COLOR,
  proximity = 120,
  speedTrigger = 100,
  maxSpeed = 5000,
  shockRadius = 250,
  shockStrength = 5,
  resistance = 750,
  returnDuration = 1.5,
  active = true,
  reducedMotion = false,
  localizedReveal = false,
  revealRadius = 120,
  revealFeather = 28,
  children,
  className,
  style,
  ...props
}: InteractiveGridProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const latestPointerRef = useRef({ clientX: -1000, clientY: -1000, available: false });

  // The hero grid becomes active only after the preloader exits. Remember the
  // pointer while it is covered so Tap To Change reacts on its first frame,
  // even when the cursor is already resting over the wordmark.
  useEffect(() => {
    const rememberPointer = (event: PointerEvent) => {
      latestPointerRef.current = {
        clientX: event.clientX,
        clientY: event.clientY,
        available: true,
      };
    };

    window.addEventListener("pointermove", rememberPointer, { passive: true });
    return () => window.removeEventListener("pointermove", rememberPointer);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const content = contentRef.current;
    if (!root || !canvas || !content) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const maskCanvas = document.createElement("canvas");
    const maskContext = maskCanvas.getContext("2d", { willReadFrequently: true });
    if (!maskContext) return;

    let width = 1;
    let height = 1;
    let dpr = 1;
    let frame = 0;
    let visible = false;
    let documentVisible = !document.hidden;
    let lastFrameTime = performance.now();
    let lastPointerTime = 0;
    let lastPointerX = 0;
    let lastPointerY = 0;
    let pointerVelocityX = 0;
    let pointerVelocityY = 0;
    let renderedDotSize = dotSize;
    let renderedRevealRadius = revealRadius;
    let renderedRevealFeather = revealFeather;
    let revealProgress = 0;
    let revealTarget = 0;
    let touchResetTimer = 0;
    const pointer = { x: -1000, y: -1000, inside: false };
    const dots: Dot[] = [];
    const baseRgb = parseHexColor(baseColor);
    const activeRgb = parseHexColor(activeColor);
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;

    const updateSolidMask = () => {
      if (!localizedReveal || revealProgress < 0.008) {
        content.style.maskImage = "none";
        content.style.webkitMaskImage = "none";
        return;
      }

      const radius = renderedRevealRadius * revealProgress;
      const innerRadius = Math.max(0, radius - renderedRevealFeather);
      const middleRadius = innerRadius + (radius - innerRadius) * 0.62;
      const mask = `radial-gradient(circle at ${pointer.x}px ${pointer.y}px, transparent 0 ${innerRadius}px, rgba(0, 0, 0, 0.28) ${middleRadius}px, #000 ${radius}px)`;
      content.style.maskImage = mask;
      content.style.webkitMaskImage = mask;
    };

    const renderMask = () => {
      maskCanvas.width = Math.max(1, Math.round(width * dpr));
      maskCanvas.height = Math.max(1, Math.round(height * dpr));
      maskContext.setTransform(dpr, 0, 0, dpr, 0, 0);
      maskContext.clearRect(0, 0, width, height);

      const computed = window.getComputedStyle(root);
      const requestedSize = Number.parseFloat(computed.fontSize) || height;
      const requestedLineHeight = Number.parseFloat(computed.lineHeight) || requestedSize * 0.78;
      const fontFamily = computed.fontFamily || "sans-serif";
      const fontWeight = computed.fontWeight || "800";
      const lines = text.split("\n");
      const setFont = (size: number) => {
        maskContext.font = `${fontWeight} ${size}px ${fontFamily}`;
      };

      const measureBlock = (size: number) => {
        setFont(size);
        const metrics = lines.map((line) => maskContext.measureText(line));
        const ascent = Math.max(...metrics.map((metric) => metric.actualBoundingBoxAscent), size * 0.72);
        const descent = Math.max(...metrics.map((metric) => metric.actualBoundingBoxDescent), size * 0.08);
        const lineHeight = (requestedLineHeight / requestedSize) * size;

        return {
          ascent,
          descent,
          lineHeight,
          width: Math.max(...metrics.map((metric) => metric.width), 1),
          height: ascent + descent + lineHeight * (lines.length - 1),
        };
      };

      const initialBlock = measureBlock(requestedSize);
      const fittedSize = Math.min(
        requestedSize,
        requestedSize * ((width * 0.94) / initialBlock.width),
        requestedSize * ((height * 0.91) / Math.max(1, initialBlock.height)),
      );

      setFont(fittedSize);
      const block = measureBlock(fittedSize);
      const baseline = (height - block.height) / 2 + block.ascent;
      maskContext.fillStyle = "#fff";
      maskContext.textAlign = "center";
      maskContext.textBaseline = "alphabetic";
      lines.forEach((line, index) => {
        maskContext.fillText(line, width / 2, baseline + block.lineHeight * index);
      });
    };

    const buildGrid = () => {
      const bounds = root.getBoundingClientRect();
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      dpr = Math.min(2, window.devicePixelRatio || 1);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      renderMask();
      const mask = maskContext.getImageData(0, 0, maskCanvas.width, maskCanvas.height).data;
      const densityScale = width < 520 ? 0.58 : width < 820 ? 0.78 : 1;
      renderedDotSize = Math.max(3.5, dotSize * densityScale);
      renderedRevealRadius = revealRadius;
      renderedRevealFeather = Math.min(revealFeather, renderedRevealRadius * 0.12);
      const spacing = Math.max(7, renderedDotSize + gap * densityScale);
      const nextDots: Dot[] = [];
      let row = 0;

      for (let y = spacing / 2; y < height; y += spacing) {
        const stagger = row % 2 === 0 ? 0 : spacing / 2;
        for (let x = spacing / 2 + stagger; x < width; x += spacing) {
          const sampleX = Math.min(maskCanvas.width - 1, Math.max(0, Math.round(x * dpr)));
          const sampleY = Math.min(maskCanvas.height - 1, Math.max(0, Math.round(y * dpr)));
          const alpha = mask[(sampleY * maskCanvas.width + sampleX) * 4 + 3];
          if (alpha > 96) {
            nextDots.push({
              x,
              y,
              homeX: x,
              homeY: y,
              velocityX: 0,
              velocityY: 0,
              activity: 0,
            });
          }
        }
        row += 1;
      }

      dots.splice(0, dots.length, ...nextDots);
      draw(true);
    };

    const draw = (staticFrame = false, time = performance.now()) => {
      context.clearRect(0, 0, width, height);
      if (localizedReveal && revealProgress < 0.008) {
        updateSolidMask();
        return;
      }

      const pulse = reducedMotion || staticFrame ? 0 : (Math.sin(time * 0.0018) + 1) * 0.08;

      for (const dot of dots) {
        context.beginPath();
        context.fillStyle = mixColor(baseRgb, activeRgb, dot.activity);
        context.globalAlpha = 0.78 + pulse + dot.activity * 0.14;
        context.arc(dot.x, dot.y, renderedDotSize / 2 + dot.activity * 1.25, 0, Math.PI * 2);
        context.fill();
      }

      context.globalAlpha = 1;
      context.globalCompositeOperation = "destination-in";
      context.drawImage(maskCanvas, 0, 0, maskCanvas.width, maskCanvas.height, 0, 0, width, height);
      context.globalCompositeOperation = "source-over";

      if (localizedReveal) {
        const radius = Math.max(1, renderedRevealRadius * revealProgress);
        const innerStop = Math.max(0, Math.min(0.96, 1 - renderedRevealFeather / radius));
        const revealGradient = context.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, radius);
        revealGradient.addColorStop(0, "rgba(0, 0, 0, 1)");
        revealGradient.addColorStop(innerStop, "rgba(0, 0, 0, 1)");
        revealGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        context.globalCompositeOperation = "destination-in";
        context.fillStyle = revealGradient;
        context.fillRect(0, 0, width, height);
        context.globalCompositeOperation = "source-over";
        updateSolidMask();
      }
    };

    const animate = (time: number) => {
      if (
        !active ||
        reducedMotion ||
        !visible ||
        !documentVisible ||
        (coarsePointer && localizedReveal)
      ) {
        frame = 0;
        return;
      }

      const delta = Math.min(2, Math.max(0.5, (time - lastFrameTime) / 16.67));
      lastFrameTime = time;
      const spring = Math.max(0.012, 0.12 / Math.max(0.45, returnDuration));
      const damping = Math.max(0.76, Math.min(0.94, 1 - resistance / 10000));
      revealProgress += (revealTarget - revealProgress) * Math.min(1, 0.2 * delta);
      if (revealTarget === 0 && revealProgress < 0.008) revealProgress = 0;

      for (const dot of dots) {
        if (pointer.inside) {
          const deltaX = dot.x - pointer.x;
          const deltaY = dot.y - pointer.y;
          const distance = Math.hypot(deltaX, deltaY) || 1;
          if (distance < proximity) {
            const influence = 1 - distance / proximity;
            const pointerSpeed = Math.min(maxSpeed, Math.hypot(pointerVelocityX, pointerVelocityY));
            const speedBoost = pointerSpeed > speedTrigger ? 1 + pointerSpeed / maxSpeed : 0.55;
            dot.velocityX += (deltaX / distance) * influence * speedBoost * 0.62;
            dot.velocityY += (deltaY / distance) * influence * speedBoost * 0.62;
            dot.activity = Math.max(dot.activity, influence);
          }
        }

        dot.velocityX += (dot.homeX - dot.x) * spring * delta;
        dot.velocityY += (dot.homeY - dot.y) * spring * delta;
        dot.velocityX *= Math.pow(damping, delta);
        dot.velocityY *= Math.pow(damping, delta);
        dot.x += dot.velocityX * delta;
        dot.y += dot.velocityY * delta;
        dot.activity *= Math.pow(0.9, delta);
      }

      draw(false, time);
      frame = window.requestAnimationFrame(animate);
    };

    const start = () => {
      if (
        frame ||
        !active ||
        reducedMotion ||
        !visible ||
        !documentVisible ||
        (coarsePointer && localizedReveal)
      ) return;
      lastFrameTime = performance.now();
      frame = window.requestAnimationFrame(animate);
    };

    const stop = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
    };

    const pointerPosition = (event: PointerEvent) => {
      const bounds = root.getBoundingClientRect();
      return {
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
        inside:
          event.clientX >= bounds.left &&
          event.clientX <= bounds.right &&
          event.clientY >= bounds.top &&
          event.clientY <= bounds.bottom,
      };
    };

    const restorePointerPosition = () => {
      if (coarsePointer || reducedMotion || !active || !latestPointerRef.current.available) return;

      const bounds = root.getBoundingClientRect();
      const { clientX, clientY } = latestPointerRef.current;
      pointer.x = clientX - bounds.left;
      pointer.y = clientY - bounds.top;
      pointer.inside =
        clientX >= bounds.left &&
        clientX <= bounds.right &&
        clientY >= bounds.top &&
        clientY <= bounds.bottom;
      revealTarget = pointer.inside ? 1 : 0;
      lastPointerX = pointer.x;
      lastPointerY = pointer.y;
      lastPointerTime = performance.now();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (coarsePointer || reducedMotion || !active) return;
      const next = pointerPosition(event);
      const now = performance.now();
      const delta = Math.max(1, now - (lastPointerTime || now));
      pointerVelocityX = Math.max(-maxSpeed, Math.min(maxSpeed, ((next.x - lastPointerX) / delta) * 1000));
      pointerVelocityY = Math.max(-maxSpeed, Math.min(maxSpeed, ((next.y - lastPointerY) / delta) * 1000));
      lastPointerTime = now;
      lastPointerX = next.x;
      lastPointerY = next.y;
      pointer.x = next.x;
      pointer.y = next.y;
      pointer.inside = next.inside;
      revealTarget = next.inside ? 1 : 0;
      if (!next.inside) {
        pointerVelocityX = 0;
        pointerVelocityY = 0;
      }
    };

    const onPointerLeave = () => {
      pointer.inside = false;
      pointerVelocityX = 0;
      pointerVelocityY = 0;
      revealTarget = 0;
    };

    const onPointerDown = (event: PointerEvent) => {
      if (reducedMotion) return;
      const impact = pointerPosition(event);
      if (!impact.inside) return;
      pointer.x = impact.x;
      pointer.y = impact.y;
      pointer.inside = true;
      revealTarget = 1;

      for (const dot of dots) {
        const deltaX = dot.x - impact.x;
        const deltaY = dot.y - impact.y;
        const distance = Math.hypot(deltaX, deltaY) || 1;
        if (distance >= shockRadius) continue;
        const falloff = 1 - distance / shockRadius;
        dot.velocityX += (deltaX / distance) * shockStrength * falloff;
        dot.velocityY += (deltaY / distance) * shockStrength * falloff;
        dot.activity = Math.max(dot.activity, falloff);
      }

      if (coarsePointer) {
        window.clearTimeout(touchResetTimer);
        touchResetTimer = window.setTimeout(() => {
          pointer.inside = false;
          revealTarget = 0;
        }, 720);
      }
    };

    const onVisibilityChange = () => {
      documentVisible = !document.hidden;
      if (documentVisible) start();
      else stop();
    };

    const resizeObserver = new ResizeObserver(buildGrid);
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start();
        else stop();
      },
      { rootMargin: "20% 0px", threshold: 0 },
    );

    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    void fontsReady.then(() => {
      buildGrid();
      restorePointerPosition();
      start();
    });
    resizeObserver.observe(root);
    intersectionObserver.observe(root);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    root.addEventListener("pointerleave", onPointerLeave, { passive: true });
    root.addEventListener("pointerdown", onPointerDown, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      stop();
      window.clearTimeout(touchResetTimer);
      content.style.maskImage = "none";
      content.style.webkitMaskImage = "none";
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerleave", onPointerLeave);
      root.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [
    active,
    activeColor,
    baseColor,
    dotSize,
    gap,
    maxSpeed,
    proximity,
    reducedMotion,
    localizedReveal,
    resistance,
    revealFeather,
    revealRadius,
    returnDuration,
    shockRadius,
    shockStrength,
    speedTrigger,
    text,
  ]);

  const rootStyle: CSSProperties = {
    touchAction: "pan-y",
    ...style,
  };

  return (
    <div ref={rootRef} className={cn("relative", className)} style={rootStyle} {...props}>
      <div ref={contentRef} className="relative z-[1]">
        {children}
      </div>
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-[2] block h-full w-full" aria-hidden="true" />
    </div>
  );
}
