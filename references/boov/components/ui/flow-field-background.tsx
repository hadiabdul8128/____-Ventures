"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export type NeuralBackgroundProps = {
  className?: string;
  color?: string;
  trailOpacity?: number;
  particleCount?: number;
  speed?: number;
  active?: boolean;
  reducedMotion?: boolean;
  onPointerBurst?: () => void;
};

type Burst = {
  x: number;
  y: number;
  life: number;
};

export default function NeuralBackground({
  className,
  color = "#b8a7e8",
  trailOpacity = 0.13,
  particleCount = 500,
  speed = 0.72,
  active = true,
  reducedMotion = false,
  onPointerBurst,
}: NeuralBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const burstCallbackRef = useRef(onPointerBurst);

  useEffect(() => {
    burstCallbackRef.current = onPointerBurst;
  }, [onPointerBurst]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const contextCandidate = canvas.getContext("2d", { alpha: false });
    if (!contextCandidate) return;
    const context: CanvasRenderingContext2D = contextCandidate;

    let width = 1;
    let height = 1;
    let frame = 0;
    let visible = false;
    let documentVisible = !document.hidden;
    const pointer = { x: -1000, y: -1000, active: false };
    const bursts: Burst[] = [];
    const particles: Particle[] = [];

    class Particle {
      x = 0;
      y = 0;
      vx = 0;
      vy = 0;
      age = 0;
      life = 180;

      constructor() {
        this.reset();
        this.age = Math.random() * this.life;
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = 0;
        this.vy = 0;
        this.age = 0;
        this.life = Math.random() * 220 + 140;
      }

      update() {
        const angle = (Math.cos(this.x * 0.0045) + Math.sin(this.y * 0.0045)) * Math.PI;
        this.vx += Math.cos(angle) * 0.16 * speed;
        this.vy += Math.sin(angle) * 0.16 * speed;

        if (pointer.active) {
          const dx = pointer.x - this.x;
          const dy = pointer.y - this.y;
          const distance = Math.hypot(dx, dy) || 1;
          const radius = 165;
          if (distance < radius) {
            const force = (radius - distance) / radius;
            this.vx -= (dx / distance) * force * 2.5;
            this.vy -= (dy / distance) * force * 2.5;
          }
        }

        for (const burst of bursts) {
          const dx = this.x - burst.x;
          const dy = this.y - burst.y;
          const distance = Math.hypot(dx, dy) || 1;
          const radius = 230 * burst.life;
          if (distance < radius) {
            const force = (1 - distance / radius) * burst.life * 4.8;
            this.vx += (dx / distance) * force;
            this.vy += (dy / distance) * force;
          }
        }

        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.948;
        this.vy *= 0.948;
        this.age += 1;

        if (this.age > this.life) this.reset();
        if (this.x < -2) this.x = width + 2;
        if (this.x > width + 2) this.x = -2;
        if (this.y < -2) this.y = height + 2;
        if (this.y > height + 2) this.y = -2;
      }

      draw() {
        const lifeProgress = this.age / this.life;
        const alpha = Math.max(0.08, 1 - Math.abs(lifeProgress - 0.5) * 2);
        context.globalAlpha = alpha * 0.72;
        context.fillStyle = color;
        context.fillRect(this.x, this.y, 1.35, 1.35);
      }
    }

    const effectiveCount = () => (
      window.matchMedia("(max-width: 900px)").matches
        ? Math.min(220, particleCount)
        : particleCount
    );

    const paintBackground = (opacity = 1) => {
      context.globalAlpha = opacity;
      context.fillStyle = "#05091a";
      context.fillRect(0, 0, width, height);
      context.globalAlpha = 1;
    };

    const initialize = () => {
      const bounds = container.getBoundingClientRect();
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      paintBackground();
      particles.length = 0;
      for (let index = 0; index < effectiveCount(); index += 1) {
        particles.push(new Particle());
      }

      if (reducedMotion) {
        particles.forEach((particle) => particle.draw());
        context.globalAlpha = 1;
      }
    };

    const animate = () => {
      if (!active || !visible || !documentVisible || reducedMotion) {
        frame = 0;
        return;
      }

      context.globalAlpha = 1;
      context.fillStyle = `rgba(5, 9, 26, ${trailOpacity})`;
      context.fillRect(0, 0, width, height);

      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });
      context.globalAlpha = 1;

      for (let index = bursts.length - 1; index >= 0; index -= 1) {
        bursts[index].life -= 0.055;
        if (bursts[index].life <= 0) bursts.splice(index, 1);
      }

      frame = requestAnimationFrame(animate);
    };

    const start = () => {
      if (frame || !active || !visible || !documentVisible || reducedMotion) return;
      frame = requestAnimationFrame(animate);
    };

    const stop = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };

    const updatePointer = (event: PointerEvent) => {
      const bounds = container.getBoundingClientRect();
      const inside =
        event.clientX >= bounds.left &&
        event.clientX <= bounds.right &&
        event.clientY >= bounds.top &&
        event.clientY <= bounds.bottom;
      pointer.active = inside;
      pointer.x = event.clientX - bounds.left;
      pointer.y = event.clientY - bounds.top;
    };

    const clearPointer = () => {
      pointer.active = false;
      pointer.x = -1000;
      pointer.y = -1000;
    };

    const createBurst = (event: PointerEvent) => {
      const bounds = container.getBoundingClientRect();
      const inside =
        event.clientX >= bounds.left &&
        event.clientX <= bounds.right &&
        event.clientY >= bounds.top &&
        event.clientY <= bounds.bottom;
      if (!inside || reducedMotion) return;
      bursts.push({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
        life: 1,
      });
      burstCallbackRef.current?.();
    };

    const onVisibilityChange = () => {
      documentVisible = !document.hidden;
      if (documentVisible) start();
      else stop();
    };

    const resizeObserver = new ResizeObserver(initialize);
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start();
        else stop();
      },
      { rootMargin: "35% 0px", threshold: 0 },
    );

    initialize();
    resizeObserver.observe(container);
    visibilityObserver.observe(container);
    window.addEventListener("pointermove", updatePointer, { passive: true });
    window.addEventListener("pointerdown", createBurst, { passive: true });
    window.addEventListener("blur", clearPointer);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      stop();
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      window.removeEventListener("pointermove", updatePointer);
      window.removeEventListener("pointerdown", createBurst);
      window.removeEventListener("blur", clearPointer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [active, color, particleCount, reducedMotion, speed, trailOpacity]);

  return (
    <div ref={containerRef} className={cn("relative h-full w-full overflow-hidden", className)} aria-hidden="true">
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
