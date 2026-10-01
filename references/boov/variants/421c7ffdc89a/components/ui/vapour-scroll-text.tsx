"use client";

import { type MotionValue, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import styles from "./vapour-scroll-text.module.css";

type Particle = {
  x: number;
  y: number;
  threshold: number;
  driftX: number;
  driftY: number;
};

type VapourScrollTextProps = {
  lines: string[];
  progress: MotionValue<number>;
  range: [number, number];
  mode: "vaporize" | "materialize";
  direction?: "left-to-right" | "right-to-left";
  className?: string;
};

const SAMPLE_SPACING = 2;
const PARTICLE_SIZE = 2.1;
const TEXT_PADDING = 6;

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}

function hash(value: number) {
  return Math.abs(Math.sin(value * 12.9898) * 43758.5453) % 1;
}

export function VapourScrollText({
  lines,
  progress,
  range,
  mode,
  direction = "left-to-right",
  className,
}: VapourScrollTextProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const sizeRef = useRef({ width: 0, height: 0, dpr: 1 });
  const colorRef = useRef("rgb(221, 212, 247)");
  const frameRef = useRef(0);
  const prefersReducedMotion = useReducedMotion();

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    const { width, height, dpr } = sizeRef.current;
    if (!canvas || !context || width === 0 || height === 0) return;

    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, width, height);
    context.fillStyle = colorRef.current;
    context.shadowColor = colorRef.current;
    context.shadowBlur = prefersReducedMotion ? 0 : 3;

    const [start, end] = range;
    const localProgress = prefersReducedMotion
      ? mode === "materialize" ? 1 : 0
      : clamp((progress.get() - start) / Math.max(0.001, end - start));

    for (const particle of particlesRef.current) {
      const phase = mode === "vaporize"
        ? clamp((localProgress - particle.threshold) / 0.22)
        : clamp((localProgress - particle.threshold) / 0.26);
      const visible = mode === "vaporize" ? 1 - phase : phase;
      if (visible <= 0.02) continue;

      const displacement = mode === "vaporize" ? phase : 1 - phase;
      const directionalDrift = direction === "left-to-right" ? 1 : -1;
      const x = particle.x + particle.driftX * displacement * directionalDrift;
      const y = particle.y + particle.driftY * displacement;

      context.globalAlpha = visible;
      context.fillRect(x, y, PARTICLE_SIZE, PARTICLE_SIZE);
    }

    context.globalAlpha = 1;
    context.shadowBlur = 0;
  }, [direction, mode, prefersReducedMotion, progress, range]);

  const scheduleDraw = useCallback(() => {
    if (frameRef.current) return;
    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = 0;
      draw();
    });
  }, [draw]);

  const sampleText = useCallback(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const rect = root.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const computed = window.getComputedStyle(root);
    const fontSize = Number.parseFloat(computed.fontSize) || 80;
    const lineHeight = Number.parseFloat(computed.lineHeight) || fontSize * 0.84;
    const fontWeight = computed.fontWeight || "800";
    const fontFamily = computed.fontFamily || "sans-serif";
    const color = computed.color || "rgb(221, 212, 247)";

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    sizeRef.current = { width, height, dpr };
    colorRef.current = color;

    const sampleCanvas = document.createElement("canvas");
    sampleCanvas.width = canvas.width;
    sampleCanvas.height = canvas.height;
    const sampleContext = sampleCanvas.getContext("2d", { willReadFrequently: true });
    if (!sampleContext) return;

    sampleContext.setTransform(dpr, 0, 0, dpr, 0, 0);
    sampleContext.clearRect(0, 0, width, height);
    sampleContext.fillStyle = color;
    sampleContext.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    sampleContext.textAlign = "left";
    sampleContext.textBaseline = "top";

    const longestLine = Math.max(
      ...lines.map((line) => sampleContext.measureText(line).width),
      1,
    );
    const availableWidth = Math.max(1, width - TEXT_PADDING * 2);
    const fitScale = Math.min(1, availableWidth / longestLine);
    const fittedFontSize = fontSize * fitScale;
    const fittedLineHeight = lineHeight * fitScale;

    sampleContext.font = `${fontWeight} ${fittedFontSize}px ${fontFamily}`;

    const textHeight = lines.length * fittedLineHeight;
    const startY = Math.max(0, (height - textHeight) * 0.5);
    lines.forEach((line, index) => {
      sampleContext.fillText(line, TEXT_PADDING, startY + index * fittedLineHeight);
    });

    const image = sampleContext.getImageData(0, 0, sampleCanvas.width, sampleCanvas.height);
    const step = Math.max(2, Math.round(SAMPLE_SPACING * dpr));
    const particles: Particle[] = [];

    for (let y = 0; y < sampleCanvas.height; y += step) {
      for (let x = 0; x < sampleCanvas.width; x += step) {
        const alpha = image.data[(y * sampleCanvas.width + x) * 4 + 3];
        if (alpha < 72) continue;

        const cssX = x / dpr;
        const cssY = y / dpr;
        const order = direction === "left-to-right" ? cssX / width : 1 - cssX / width;
        const seed = particles.length + x * 0.17 + y * 0.31;
        particles.push({
          x: cssX,
          y: cssY,
          threshold: clamp(order * 0.72 + hash(seed) * 0.12),
          driftX: 18 + hash(seed + 4) * 38,
          driftY: (hash(seed + 9) - 0.5) * 72,
        });
      }
    }

    particlesRef.current = particles;
    scheduleDraw();
  }, [direction, lines, scheduleDraw]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const observer = new ResizeObserver(sampleText);
    observer.observe(root);
    sampleText();
    document.fonts.ready.then(sampleText);

    return () => observer.disconnect();
  }, [sampleText]);

  useEffect(() => progress.on("change", scheduleDraw), [progress, scheduleDraw]);

  useEffect(
    () => () => {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
    },
    [],
  );

  return (
    <div ref={rootRef} className={cn(styles.root, className)}>
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      <span className={styles.accessibleText}>{lines.join(" ")}</span>
    </div>
  );
}
