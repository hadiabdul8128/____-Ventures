"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const fragmentShader = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec2 uMouse;      // 0..1
  uniform float uScroll;    // 0..1 page progress
  uniform float uVelocity;  // scroll velocity, damped
  uniform float uDark;      // 0 light .. 1 dark, eased from html.dark
  uniform vec2 uResolution;

  varying vec2 vUv;

  // Warm, light "blueprint" palette (oryzo-flavoured, Boov-branded)
  const vec3 BONE_L   = vec3(0.949, 0.933, 0.898);  // #f2eee5 base
  const vec3 CREAM_L  = vec3(0.984, 0.968, 0.941);  // #fbf7f0 highlight
  const vec3 SAGE_L   = vec3(0.796, 0.816, 0.749);  // #cbd0bf muted mat green
  const vec3 TAN_L    = vec3(0.859, 0.788, 0.671);  // #dbc9ab cork tan
  const vec3 LILAC_L  = vec3(0.796, 0.749, 0.878);  // #cbbfe0 soft brand tint

  // Deep warm-ink counterparts for dark mode (match html.dark tokens)
  const vec3 BONE_D   = vec3(0.078, 0.063, 0.122);  // #14101f
  const vec3 CREAM_D  = vec3(0.102, 0.082, 0.188);  // #1a1530
  const vec3 SAGE_D   = vec3(0.141, 0.169, 0.133);  // muted moss shadow
  const vec3 TAN_D    = vec3(0.165, 0.129, 0.220);  // #2a2138 warm plum
  const vec3 LILAC_D  = vec3(0.310, 0.259, 0.443);  // #4f4271 brand glow

  // simplex-ish noise (Ashima)
  vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec2 mod289(vec2 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}
  float snoise(vec2 v){
    const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
    vec2 i=floor(v+dot(v,C.yy));
    vec2 x0=v-i+dot(i,C.xx);
    vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);
    vec4 x12=x0.xyxy+C.xxzz; x12.xy-=i1;
    i=mod289(i);
    vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));
    vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);
    m=m*m; m=m*m;
    vec3 x=2.0*fract(p*C.www)-1.0;
    vec3 h=abs(x)-0.5;
    vec3 ox=floor(x+0.5);
    vec3 a0=x-ox;
    m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);
    vec3 g;
    g.x=a0.x*x0.x+h.x*x0.y;
    g.yz=a0.yz*x12.xz+h.yz*x12.yw;
    return 130.0*dot(m,g);
  }

  float fbm(vec2 p){
    float v=0.0; float a=0.5;
    for(int i=0;i<3;i++){ v+=a*snoise(p); p*=2.0; a*=0.5; }
    return v;
  }

  void main(){
    vec2 uv=vUv;
    float aspect=uResolution.x/uResolution.y;
    vec2 p=uv; p.x*=aspect;

    float t=uTime*0.045;
    vec2 mouse=uMouse; mouse.x*=aspect;

    // flowing domain-warped noise
    vec2 q=vec2(fbm(p+t), fbm(p+vec2(3.2,1.7)-t));
    vec2 r=vec2(fbm(p+2.0*q+vec2(1.7,9.2)+0.15*t), fbm(p+2.0*q+vec2(8.3,2.8)-0.12*t));
    float n=fbm(p+2.2*r + 0.6*uVelocity);

    // mouse ripple
    float md=distance(p, mouse);
    float ripple=smoothstep(0.7,0.0,md)*0.35;
    n+=ripple;

    n=n*0.5+0.5;

    // scroll gently shifts warmth as you move down the page
    float depth=clamp(uScroll,0.0,1.0);

    // theme-blended palette so the toggle sweeps rather than snaps
    vec3 BONE  = mix(BONE_L,  BONE_D,  uDark);
    vec3 CREAM = mix(CREAM_L, CREAM_D, uDark);
    vec3 SAGE  = mix(SAGE_L,  SAGE_D,  uDark);
    vec3 TAN   = mix(TAN_L,   TAN_D,   uDark);
    vec3 LILAC = mix(LILAC_L, LILAC_D, uDark);

    // soft, low-contrast blend so body text stays readable on top
    vec3 col=mix(BONE, CREAM, smoothstep(0.30,0.75,n));
    col=mix(col, SAGE, smoothstep(0.55,0.95,n)*0.35);
    col=mix(col, TAN, smoothstep(0.10,0.42,n)*(0.22+0.14*depth));
    col=mix(col, LILAC, smoothstep(0.86,1.0,n)*(0.35+0.4*ripple));

    // gentle vignette toward the warm base
    float vig=smoothstep(1.35,0.25,length(uv-0.5));
    col=mix(col*0.965, col, vig);

    // fine paper grain
    float g=fract(sin(dot(uv*uResolution, vec2(12.9898,78.233)))*43758.5453);
    col+=(g-0.5)*0.015;

    gl_FragColor=vec4(col,1.0);
  }
`;

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main(){ vUv=uv; gl_Position=vec4(position,1.0); }
`;

function FluidPlane() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { size } = useThree();
  const mouse = useRef(new THREE.Vector2(0.5, 0.5));
  const mouseTarget = useRef(new THREE.Vector2(0.5, 0.5));
  const scroll = useRef(0);
  const velocity = useRef(0);

  const dark = useRef(0);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uScroll: { value: 0 },
      uVelocity: { value: 0 },
      uDark: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
    }),
    [],
  );

  // Track html.dark (the theme toggler flips it) and ease the shader palette
  // toward the active theme instead of snapping.
  useEffect(() => {
    const root = document.documentElement;
    const update = () => {
      dark.current = root.classList.contains("dark") ? 1 : 0;
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let lastScroll = window.scrollY;
    const onMove = (e: MouseEvent) => {
      mouseTarget.current.set(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight);
    };
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scroll.current = max > 0 ? window.scrollY / max : 0;
      velocity.current += Math.abs(window.scrollY - lastScroll) * 0.002;
      lastScroll = window.scrollY;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useFrame((_, delta) => {
    const m = materialRef.current;
    if (!m) return;
    m.uniforms.uTime.value += delta;
    mouse.current.lerp(mouseTarget.current, 0.05);
    m.uniforms.uMouse.value.copy(mouse.current);
    m.uniforms.uScroll.value += (scroll.current - m.uniforms.uScroll.value) * 0.06;
    velocity.current *= 0.9;
    m.uniforms.uVelocity.value += (velocity.current - m.uniforms.uVelocity.value) * 0.1;
    m.uniforms.uDark.value += (dark.current - m.uniforms.uDark.value) * 0.08;
    m.uniforms.uResolution.value.set(size.width, size.height);
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

export default function FluidBackground() {
  const prefersReducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [useStaticBackground, setUseStaticBackground] = useState(false);

  useEffect(() => {
    const staticQuery = window.matchMedia(
      "(max-width: 900px), (hover: none), (pointer: coarse)",
    );
    const update = () => setUseStaticBackground(staticQuery.matches);
    update();
    setMounted(true);
    staticQuery.addEventListener("change", update);
    return () => staticQuery.removeEventListener("change", update);
  }, []);

  // Phones keep the same palette without continuously compositing WebGL
  // behind several sticky/canvas chapters.
  if (prefersReducedMotion || useStaticBackground || !mounted) {
    return <div className="boov-fluid-fallback" aria-hidden="true" />;
  }

  return (
    <div className="boov-fluid" aria-hidden="true">
      <Canvas
        gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
        dpr={1}
        camera={{ position: [0, 0, 1] }}
        frameloop="always"
      >
        <FluidPlane />
      </Canvas>
    </div>
  );
}
