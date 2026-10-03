import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

const vertexSource = `
  attribute vec2 a_position;
  varying vec2 vUv;
  void main() {
    vUv = .5 * (a_position + 1.);
    gl_Position = vec4(a_position, 0., 1.);
  }
`;

// Adapted from the supplied neural vortex: silver light, slower drift, and
// bounded highlights so the background never competes with the brochure copy.
const fragmentSource = `
  precision mediump float;
  varying vec2 vUv;
  uniform float u_time;
  uniform float u_ratio;
  uniform vec2 u_pointer_position;
  uniform float u_scroll_progress;

  vec2 rotate(vec2 uv, float angle) {
    return mat2(cos(angle), sin(angle), -sin(angle), cos(angle)) * uv;
  }

  float neuro_shape(vec2 uv, float t, float p) {
    vec2 sine_acc = vec2(0.);
    vec2 res = vec2(0.);
    float scale = 8.;
    for (int j = 0; j < 15; j++) {
      uv = rotate(uv, 1.);
      sine_acc = rotate(sine_acc, 1.);
      vec2 layer = uv * scale + float(j) + sine_acc - t;
      sine_acc += sin(layer) + 2.4 * p;
      res += (.5 + .5 * cos(layer)) / scale;
      scale *= 1.2;
    }
    return res.x + res.y;
  }

  void main() {
    vec2 uv = .5 * vUv;
    uv.x *= max(u_ratio, .7);
    uv = rotate(uv, -.16 + u_scroll_progress * .05);
    vec2 pointer = vUv - u_pointer_position;
    pointer.x *= u_ratio;
    float p = .22 * pow(1. - clamp(length(pointer), 0., 1.), 2.);
    float noise = neuro_shape(uv, u_time * .00016, p);
    noise = 1.2 * pow(noise, 3.);
    noise += pow(min(noise, 2.), 10.);
    float light = 1. - exp(-max(0., noise - .22) * 1.15);
    float vignette = 1. - smoothstep(.15, .8, length(vUv - .5));
    gl_FragColor = vec4(vec3(light * (.3 + .32 * vignette)), 1.);
  }
`;

export default function InteractiveNeuralVortex() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [paused, setPaused] = useState(false);
  const [available, setAvailable] = useState(false);
  const pausedRef = useRef(paused);
  const refreshRef = useRef<() => void>(() => {});

  useEffect(() => {
    pausedRef.current = paused;
    refreshRef.current();
  }, [paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = canvas?.closest<HTMLElement>(".venture-flow");
    const stage = canvas?.parentElement;
    if (!canvas || !section || !stage) return;

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      powerPreference: "low-power",
    });
    if (!gl) {
      console.warn("Vortex: WebGL unavailable; using static fallback.");
      return;
    }

    const shaders: WebGLShader[] = [];
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      shaders.push(shader);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.warn("Vortex shader:", gl.getShaderInfoLog(shader));
        return null;
      }
      return shader;
    };
    const vertex = compile(gl.VERTEX_SHADER, vertexSource);
    const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
    const program = gl.createProgram();
    const buffer = gl.createBuffer();
    const release = () => {
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      shaders.forEach((shader) => gl.deleteShader(shader));
    };
    if (!vertex || !fragment || !program || !buffer) {
      release();
      return;
    }
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      release();
      return;
    }
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const position = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const time = gl.getUniformLocation(program, "u_time");
    const ratio = gl.getUniformLocation(program, "u_ratio");
    const pointerPosition = gl.getUniformLocation(
      program,
      "u_pointer_position",
    );
    const scrollProgress = gl.getUniformLocation(program, "u_scroll_progress");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = { x: 0.65, y: 0.55, targetX: 0.65, targetY: 0.55 };
    let frame = 0;
    let visible = false;
    let lost = false;
    let elapsed = 12000;
    let lastTime = 0;
    let lastDraw = 0;

    const canAnimate = () =>
      visible &&
      !document.hidden &&
      !motionQuery.matches &&
      !pausedRef.current &&
      !lost;
    const draw = () => {
      if (lost) return;
      gl.uniform1f(time, elapsed);
      gl.uniform2f(pointerPosition, pointer.x, pointer.y);
      const bounds = section.getBoundingClientRect();
      gl.uniform1f(
        scrollProgress,
        Math.max(0, Math.min(1, -bounds.top / bounds.height)),
      );
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    const tick = (now: number) => {
      frame = 0;
      if (!canAnimate()) return;
      if (now - lastDraw >= 1000 / 30) {
        const delta = lastTime ? Math.min(now - lastTime, 80) : 0;
        elapsed += delta;
        const easing = 1 - Math.exp(-delta / 400);
        pointer.x += (pointer.targetX - pointer.x) * easing;
        pointer.y += (pointer.targetY - pointer.y) * easing;
        lastTime = lastDraw = now;
        draw();
      }
      frame = requestAnimationFrame(tick);
    };
    const refresh = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = lastDraw = 0;
      if (canAnimate()) frame = requestAnimationFrame(tick);
      else if (visible && !document.hidden) draw();
    };
    refreshRef.current = refresh;
    const resize = () => {
      const { width, height } = stage.getBoundingClientRect();
      // Bound shader work on Retina/mobile screens as well as very wide displays.
      const scale = Math.min(
        window.devicePixelRatio || 1,
        1.5,
        Math.sqrt(1_200_000 / Math.max(1, width * height)),
      );
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform1f(ratio, canvas.width / canvas.height);
      draw();
    };
    const move = (event: PointerEvent) => {
      if (!canAnimate()) return;
      const bounds = stage.getBoundingClientRect();
      pointer.targetX = Math.max(
        0,
        Math.min(1, (event.clientX - bounds.left) / bounds.width),
      );
      pointer.targetY =
        1 -
        Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
    };
    const reset = () => {
      pointer.targetX = 0.65;
      pointer.targetY = 0.55;
    };
    const contextLost = (event: Event) => {
      event.preventDefault();
      lost = true;
      cancelAnimationFrame(frame);
      setAvailable(false);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      refresh();
    });
    const resizeObserver = new ResizeObserver(resize);
    observer.observe(section);
    resizeObserver.observe(stage);
    section.addEventListener("pointermove", move, { passive: true });
    section.addEventListener("pointerleave", reset);
    document.addEventListener("visibilitychange", refresh);
    motionQuery.addEventListener("change", refresh);
    canvas.addEventListener("webglcontextlost", contextLost);
    resize();
    setAvailable(true);

    return () => {
      refreshRef.current = () => {};
      cancelAnimationFrame(frame);
      observer.disconnect();
      resizeObserver.disconnect();
      section.removeEventListener("pointermove", move);
      section.removeEventListener("pointerleave", reset);
      document.removeEventListener("visibilitychange", refresh);
      motionQuery.removeEventListener("change", refresh);
      canvas.removeEventListener("webglcontextlost", contextLost);
      release();
    };
  }, []);

  return (
    <>
      <div className="neural-vortex" aria-hidden="true" data-ready={available}>
        <div className="neural-vortex-stage">
          <div className="neural-vortex-fallback" />
          <canvas ref={canvasRef} className="neural-vortex-canvas" />
        </div>
      </div>
      {available && (
        <button
          type="button"
          className="neural-motion-toggle"
          onClick={() => setPaused(!paused)}
          aria-label={
            paused ? "Play background animation" : "Pause background animation"
          }
          aria-pressed={paused}
        >
          {paused ? (
            <Play size={12} aria-hidden="true" />
          ) : (
            <Pause size={12} aria-hidden="true" />
          )}
          <span>{paused ? "play motion" : "pause motion"}</span>
        </button>
      )}
    </>
  );
}
