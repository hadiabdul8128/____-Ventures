import { memo, useEffect, useId, useRef, useState } from "react";
import styles from "./GoldMonolith.module.css";

type Vector = [number, number, number];

// A closed ribbon whose cross-section gradually turns around its elliptical axis.
// The geometry and studio lighting are original; the restrained pointer response
// takes its cue from Boov's FluidBackground and OrbitField.
function surface(u: number, v: number): Vector {
  const twist = 0.56 * Math.sin(u - 0.5) + 0.32;
  const width = 0.55 * (0.94 + 0.12 * Math.cos(u * 2 - 0.3));
  const w = Math.cos(v) * width;
  const h = Math.sin(v) * 0.205;
  const radial = w * Math.cos(twist) - h * Math.sin(twist);
  return [
    (1.63 + radial) * Math.cos(u),
    (2.02 + radial) * Math.sin(u),
    0.09 * Math.cos(u * 2) + w * Math.sin(twist) + h * Math.cos(twist),
  ];
}

function makeRibbon() {
  const around = 240;
  const across = 48;
  const vertices: number[] = [];
  const indices: number[] = [];
  const e = 0.0005;

  for (let i = 0; i <= around; i++) {
    const u = (i / around) * Math.PI * 2;
    for (let j = 0; j <= across; j++) {
      const v = (j / across) * Math.PI * 2;
      const p = surface(u, v);
      const a = surface(u + e, v);
      const b = surface(u, v + e);
      const du = a.map((x, k) => x - p[k]);
      const dv = b.map((x, k) => x - p[k]);
      const normal = [
        du[1] * dv[2] - du[2] * dv[1],
        du[2] * dv[0] - du[0] * dv[2],
        du[0] * dv[1] - du[1] * dv[0],
      ];
      const length = Math.hypot(...normal);
      vertices.push(
        ...p,
        ...normal.map((n) => n / length),
        i / around,
        j / across,
      );
      if (i < around && j < across) {
        const n = i * (across + 1) + j;
        indices.push(
          n,
          n + across + 1,
          n + 1,
          n + 1,
          n + across + 1,
          n + across + 2,
        );
      }
    }
  }
  return {
    vertices: new Float32Array(vertices),
    indices: new Uint16Array(indices),
  };
}

const vertexSource = `
  attribute vec3 aPosition;
  attribute vec3 aNormal;
  attribute vec2 aUv;
  uniform mat4 uProjection;
  uniform vec3 uRotation;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec2 vUv;
  void main() {
    vec3 c = cos(uRotation);
    vec3 s = sin(uRotation);
    mat3 x = mat3(1.,0.,0., 0.,c.x,s.x, 0.,-s.x,c.x);
    mat3 y = mat3(c.y,0.,-s.y, 0.,1.,0., s.y,0.,c.y);
    mat3 z = mat3(c.z,s.z,0., -s.z,c.z,0., 0.,0.,1.);
    mat3 rotation = z * y * x;
    vPosition = rotation * aPosition;
    vNormal = rotation * aNormal;
    vUv = aUv;
    gl_Position = uProjection * vec4(vPosition + vec3(0., 0., -7.8), 1.);
  }
`;

const fragmentSource = `
  precision highp float;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec2 vUv;

  vec3 studio(vec3 r) {
    float top = pow(max(dot(r, normalize(vec3(-.6, 1.4, 1.))), 0.), 9.);
    float softbox = exp(-pow((r.x + r.z * .42 - .26) / .15, 2.));
    softbox *= .38 + .62 * smoothstep(-.65, .6, r.y);
    float strip = exp(-pow((r.x + r.z * .72 + .46) / .032, 2.));
    float rim = pow(max(dot(r, normalize(vec3(1., -.1, -.75))), 0.), 22.);
    float warm = pow(max(dot(r, normalize(vec3(-1., -.7, .65))), 0.), 8.);
    vec3 col = vec3(.045, .035, .022);
    col += vec3(2.9, 2.65, 2.18) * top;
    col += vec3(2.25, 2.10, 1.83) * softbox;
    col += vec3(4.0, 3.50, 2.62) * strip;
    col += vec3(2.1, 1.44, .59) * rim;
    col += vec3(.60, .34, .11) * warm;
    return col;
  }

  vec3 toneMap(vec3 value) {
    return clamp((value * (2.51 * value + .03)) / (value * (2.43 * value + .59) + .14), 0., 1.);
  }

  void main() {
    vec3 n = normalize(vNormal);
    vec3 view = normalize(vec3(0., 0., 7.8) - vPosition);
    vec3 reflection = reflect(-view, n);
    vec3 gold = vec3(1., .69, .28);
    float fresnel = pow(1. - max(dot(n, view), 0.), 5.);
    vec3 conductor = mix(gold, vec3(1., .93, .71), fresnel * .72);
    float diffuse = max(dot(n, normalize(vec3(-.7, 1., 1.3))), 0.);
    vec3 color = studio(reflection) * conductor;
    color += vec3(.14, .083, .024) * (.3 + .7 * diffuse);
    float brushing = sin(vUv.x * 7000. + sin(vUv.y * 42.) * .28);
    color *= .987 + brushing * .013;
    color = pow(toneMap(color), vec3(1. / 2.2));
    gl_FragColor = vec4(color, 1.);
  }
`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Unable to create the artwork shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    throw new Error("The artwork shader is not supported");
  }
  return shader;
}

function projection(aspect: number) {
  const scale = 1 / Math.tan((40 * Math.PI) / 360);
  // Maintain the complete sculpture when a narrow container is used on phones.
  const fitting = Math.min(1, aspect / 0.84);
  return new Float32Array([
    (scale / aspect) * fitting,
    0,
    0,
    0,
    0,
    scale * fitting,
    0,
    0,
    0,
    0,
    -1.002,
    -1,
    0,
    0,
    -0.2002,
    0,
  ]);
}

function StaticRibbon({ id }: { id: string }) {
  return (
    <svg viewBox="0 0 700 760" className={styles.fallback} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-metal`} x1=".08" y1=".05" x2=".92" y2=".94">
          <stop stopColor="#5c3b13" />
          <stop offset=".18" stopColor="#c29b50" />
          <stop offset=".30" stopColor="#fae4a4" />
          <stop offset=".34" stopColor="#96713a" />
          <stop offset=".46" stopColor="#30230e" />
          <stop offset=".66" stopColor="#a7803f" />
          <stop offset=".78" stopColor="#f2d392" />
          <stop offset=".81" stopColor="#c9a361" />
          <stop offset="1" stopColor="#453017" />
        </linearGradient>
        <linearGradient id={`${id}-edge`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#f2d89b" />
          <stop offset=".32" stopColor="#382610" />
          <stop offset=".67" stopColor="#cdb275" />
          <stop offset="1" stopColor="#6e4c23" />
        </linearGradient>
      </defs>
      <g transform="rotate(-27 350 380)">
        <path
          d="M350 105C471 105 558 228 558 382C558 536 471 659 350 659C229 659 142 536 142 382C142 228 229 105 350 105ZM350 204C282 204 233 283 233 382C233 481 282 560 350 560C418 560 467 481 467 382C467 283 418 204 350 204Z"
          fill={`url(#${id}-metal)`}
          fillRule="evenodd"
        />
        <ellipse
          cx="350"
          cy="382"
          rx="116"
          ry="178"
          fill="none"
          stroke={`url(#${id}-edge)`}
          strokeWidth="7"
        />
        <ellipse
          cx="350"
          cy="382"
          rx="207"
          ry="276"
          fill="none"
          stroke={`url(#${id}-edge)`}
          strokeWidth="1.5"
        />
      </g>
    </svg>
  );
}

export const GoldMonolith = memo(function GoldMonolith({
  enabled,
  className = "",
}: {
  enabled: boolean;
  className?: string;
}) {
  const id = useId().replace(/:/g, "");
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const active = useRef(enabled);
  const [ready, setReady] = useState(false);
  const restart = useRef<(() => void) | null>(null);

  useEffect(() => {
    active.current = enabled;
    restart.current?.();
  }, [enabled]);

  useEffect(() => {
    const element = canvas.current;
    const container = host.current;
    if (!element || !container) return;
    const gl = element.getContext("webgl", {
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
      powerPreference: "low-power",
    });
    if (!gl) return;

    let frame = 0;
    let time = 0;
    let lastTick = 0;
    let inView = true;
    let destroyed = false;
    let lost = false;
    let buffer: WebGLBuffer | null = null;
    let indexBuffer: WebGLBuffer | null = null;
    let program: WebGLProgram | null = null;
    let vertex: WebGLShader | null = null;
    let fragment: WebGLShader | null = null;
    let width = 0;
    let height = 0;
    let removeListeners: (() => void) | undefined;
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = window.matchMedia("(pointer: coarse)");

    const dispose = () => {
      destroyed = true;
      cancelAnimationFrame(frame);
      restart.current = null;
      removeListeners?.();
      gl.deleteBuffer(buffer);
      gl.deleteBuffer(indexBuffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
    };

    try {
      vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);
      fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);
      program = gl.createProgram();
      if (!program) throw new Error("Unable to create the artwork renderer");
      gl.attachShader(program, vertex);
      gl.attachShader(program, fragment);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS))
        throw new Error("Unable to link artwork shaders");
      gl.useProgram(program);
      const mesh = makeRibbon();
      buffer = gl.createBuffer();
      indexBuffer = gl.createBuffer();
      if (!buffer || !indexBuffer)
        throw new Error("Unable to allocate artwork geometry");
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, mesh.vertices, gl.STATIC_DRAW);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.indices, gl.STATIC_DRAW);
      for (const [name, size, offset] of [
        ["aPosition", 3, 0],
        ["aNormal", 3, 12],
        ["aUv", 2, 24],
      ] as const) {
        const location = gl.getAttribLocation(program, name);
        gl.enableVertexAttribArray(location);
        gl.vertexAttribPointer(location, size, gl.FLOAT, false, 32, offset);
      }
      const projectionLocation = gl.getUniformLocation(program, "uProjection");
      const rotationLocation = gl.getUniformLocation(program, "uRotation");
      gl.enable(gl.DEPTH_TEST);
      gl.clearColor(0, 0, 0, 0);

      const draw = () => {
        if (destroyed || lost || width < 1 || height < 1) return;
        gl.viewport(0, 0, element.width, element.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.uniformMatrix4fv(
          projectionLocation,
          false,
          projection(width / height),
        );
        gl.uniform3f(
          rotationLocation,
          0.22 + Math.sin(time * 0.11) * 0.045 + pointer.y * 0.075,
          -0.46 + Math.sin(time * 0.14) * 0.065 + pointer.x * 0.095,
          -0.42 + Math.sin(time * 0.09) * 0.025,
        );
        gl.drawElements(
          gl.TRIANGLES,
          mesh.indices.length,
          gl.UNSIGNED_SHORT,
          0,
        );
      };

      const canAnimate = () =>
        !destroyed &&
        active.current &&
        !media.matches &&
        !coarse.matches &&
        inView &&
        !document.hidden &&
        !lost;
      const tick = (timestamp: number) => {
        frame = 0;
        if (destroyed || !canAnimate()) return;
        // Thirty frames per second is ample for this slow sculptural movement.
        if (!lastTick || timestamp - lastTick >= 31) {
          time += lastTick ? Math.min((timestamp - lastTick) / 1000, 0.05) : 0;
          lastTick = timestamp;
          pointer.x += (pointer.targetX - pointer.x) * 0.07;
          pointer.y += (pointer.targetY - pointer.y) * 0.07;
          draw();
        }
        frame = requestAnimationFrame(tick);
      };
      const sync = () => {
        cancelAnimationFrame(frame);
        frame = 0;
        lastTick = 0;
        // Retain the exact rendered pose when motion is paused.
        if (!canAnimate()) return;
        frame = requestAnimationFrame(tick);
      };
      restart.current = sync;

      const resize = () => {
        // A lost context must retain its visible SVG fallback, including after
        // subsequent ResizeObserver notifications and StrictMode cleanup.
        if (destroyed || lost) return;
        const bounds = container.getBoundingClientRect();
        width = bounds.width;
        height = bounds.height;
        if (width < 1 || height < 1) return;
        const dpr = Math.min(
          window.devicePixelRatio || 1,
          coarse.matches ? 1.5 : 1.65,
        );
        const pixelWidth = Math.max(1, Math.round(width * dpr));
        const pixelHeight = Math.max(1, Math.round(height * dpr));
        if (element.width !== pixelWidth) element.width = pixelWidth;
        if (element.height !== pixelHeight) element.height = pixelHeight;
        draw();
        setReady(true);
      };
      const onMove = (event: PointerEvent) => {
        if (!canAnimate() || event.pointerType !== "mouse") return;
        pointer.targetX = Math.max(
          -1,
          Math.min(1, (event.clientX / window.innerWidth - 0.5) * 2),
        );
        pointer.targetY = Math.max(
          -1,
          Math.min(1, (event.clientY / window.innerHeight - 0.5) * 2),
        );
      };
      const onLeave = () => {
        pointer.targetX = 0;
        pointer.targetY = 0;
      };
      const onContextLost = (event: Event) => {
        event.preventDefault();
        lost = true;
        cancelAnimationFrame(frame);
        setReady(false);
      };
      const observer = new IntersectionObserver(
        ([entry]) => {
          inView = entry.isIntersecting;
          sync();
        },
        { rootMargin: "80px" },
      );
      const resizer = new ResizeObserver(resize);
      removeListeners = () => {
        observer.disconnect();
        resizer.disconnect();
        window.removeEventListener("pointermove", onMove);
        document.documentElement.removeEventListener("pointerleave", onLeave);
        document.removeEventListener("visibilitychange", sync);
        media.removeEventListener("change", sync);
        coarse.removeEventListener("change", sync);
        element.removeEventListener("webglcontextlost", onContextLost);
      };
      observer.observe(container);
      resizer.observe(container);
      window.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
      document.addEventListener("visibilitychange", sync);
      media.addEventListener("change", sync);
      coarse.addEventListener("change", sync);
      element.addEventListener("webglcontextlost", onContextLost);
      resize();
      sync();

      return dispose;
    } catch {
      dispose();
      setReady(false);
    }
  }, []);

  return (
    <div
      ref={host}
      className={`${styles.artwork} ${className}`}
      data-ready={ready}
      aria-hidden="true"
    >
      <div className={styles.aura} />
      <svg className={styles.halo} viewBox="0 0 700 700">
        <circle cx="350" cy="350" r="317" strokeDasharray=".6 13" />
        <path
          d="M83 496A308 308 0 0 1 524 97"
          stroke="#b49556"
          strokeWidth=".4"
          fill="none"
        />
      </svg>
      <div className={styles.shadow} />
      <StaticRibbon id={id} />
      <canvas ref={canvas} className={styles.canvas} />
    </div>
  );
});
