"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const COUNT = 52;

// Precompute elliptical orbit placements echoing the Boov logo mark
// (an ellipse plus orbiting dots). Deterministic — no per-render randomness.
function useOrbitData() {
  return useMemo(() => {
    const items: { position: [number, number, number]; scale: number }[] = [];
    for (let i = 0; i < COUNT; i += 1) {
      const ring = i % 3;
      const rx = 3.2 + ring * 1.7;
      const ry = rx * 0.52;
      const angle = (i / COUNT) * Math.PI * 2 * 3;
      const depth = (ring - 1) * 1.4;
      items.push({
        position: [Math.cos(angle) * rx, Math.sin(angle) * ry, depth],
        scale: 0.03 + (i % 5) * 0.012,
      });
    }
    return items;
  }, []);
}

function Orbits() {
  const groupRef = useRef<THREE.Group>(null);
  const data = useOrbitData();

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.z += delta * 0.045;
      groupRef.current.rotation.x = Math.sin(Date.now() * 0.00006) * 0.12;
    }
  });

  return (
    <group ref={groupRef} rotation={[0.35, 0, 0]}>
      {data.map((item, index) => (
        <mesh key={index} position={item.position} scale={item.scale}>
          <sphereGeometry args={[1, 12, 12]} />
          <meshBasicMaterial
            color={index % 4 === 0 ? "#ddd4f7" : "#b8a7e8"}
            transparent
            opacity={index % 4 === 0 ? 0.9 : 0.5}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function OrbitField() {
  return (
    <Canvas
      className="boov-orbit-canvas"
      camera={{ position: [0, 0, 12], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.75]}
      style={{ pointerEvents: "none" }}
    >
      <Orbits />
    </Canvas>
  );
}
