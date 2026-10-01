import {
  Atom,
  Cpu,
  Dna,
  FlaskConical,
  Layers3,
  Leaf,
  Microscope,
  Orbit,
  Radio,
  Satellite,
  Sparkles,
  Zap,
} from "lucide-react";
import { Globe } from "./ui/globe";
import { OrbitingCircles } from "./ui/orbiting-circles";
import { lazy, Suspense } from "react";
const IconCloud = lazy(() =>
  import("./ui/icon-cloud").then((m) => ({ default: m.IconCloud })),
);
import type { COBEOptions } from "cobe";

const globeConfig: COBEOptions = {
  width: 700,
  height: 700,
  devicePixelRatio: 1.5,
  phi: 0,
  theta: 0.3,
  dark: 1,
  diffuse: 1.3,
  mapSamples: 18000,
  mapBrightness: 4.5,
  baseColor: [0.32, 0.26, 0.16],
  markerColor: [0.95, 0.77, 0.43],
  glowColor: [0.1, 0.075, 0.035],
  markers: [{ location: [42.36, -71.09], size: 0.09 }],
  onRender: () => {},
};
const iconTypes = [
  Atom,
  Cpu,
  Dna,
  FlaskConical,
  Layers3,
  Leaf,
  Microscope,
  Orbit,
  Radio,
  Satellite,
  Sparkles,
  Zap,
];
const icons = iconTypes.map((Icon, i) => (
  <Icon key={i} color="#cfb679" width="100" height="100" strokeWidth={1} />
));

export default function NetworkScene({
  mode,
  animated,
}: {
  mode: "reach" | "circles" | "frontiers";
  animated: boolean;
}) {
  if (mode === "reach")
    return (
      <div
        className="globe-wrap"
        role="img"
        aria-label="Gold globe highlighting Cambridge, Massachusetts"
      >
        <Globe config={globeConfig} animated={animated} />
      </div>
    );
  if (mode === "frontiers")
    return (
      <div
        className="cloud-wrap"
        role="img"
        aria-label="An interactive constellation of science and technology fields"
      >
        <Suspense
          fallback={
            <span className="scene-loading">Finding the frontier…</span>
          }
        >
          <IconCloud icons={icons} showControl={false} paused={!animated} />
        </Suspense>
      </div>
    );
  return (
    <div className="orbits-wrap" aria-hidden="true">
      <div className="orbit-center">
        <span>____</span>
        <small>VENTURES</small>
      </div>
      <OrbitingCircles radius={115} duration={60} iconSize={50}>
        <span className="orbit-node">H</span>
        <span className="orbit-node">M</span>
        <span className="orbit-node">↗</span>
      </OrbitingCircles>
      <OrbitingCircles radius={195} duration={90} reverse iconSize={44}>
        <span className="orbit-node">
          <Atom size={18} />
        </span>
        <span className="orbit-node">
          <Layers3 size={18} />
        </span>
        <span className="orbit-node">
          <Orbit size={18} />
        </span>
        <span className="orbit-node">
          <Zap size={18} />
        </span>
      </OrbitingCircles>
    </div>
  );
}
