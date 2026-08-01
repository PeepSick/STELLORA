import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import fragmentShader from '@/shaders/nebula.frag?raw';
import { useStellarisStore } from '@/store';

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const NebulaSystem: React.FC = React.memo(() => {
  const { galaxy } = useStellarisStore();
  const showNebula = galaxy?.showNebula ?? true;
  // Default 1.42 reproduces the original hardcoded opacity; slider scales from there
  const densityFactor = (galaxy?.nebulaDensity ?? 1.42) / 1.42;

  // 4-Layer Cinematic Parallax Nebula (Deep Void -> Mid Plum Dust -> Arm Amber Glow -> Foreground Mist)
  const layers = useMemo(() => {
    const layerConfigs = [
      // Layer 1: Deep Cosmic Void (Very large, slow, ultra deep purple/navy)
      { count: 4, scaleMin: 90, scaleMax: 130, radiusMin: 30, radiusMax: 70, speed: 0.04, opacity: 0.12, color: '#1e0f38' },
      // Layer 2: Mid-Galactic Dust Lanes (Rich royal magenta/violet)
      { count: 6, scaleMin: 50, scaleMax: 80,  radiusMin: 20, radiusMax: 85, speed: 0.08, opacity: 0.15, color: '#6b21a8' },
      // Layer 3: Arm Warm Energy Glow (Warm golden amber dust near arms)
      { count: 5, scaleMin: 35, scaleMax: 60,  radiusMin: 10, radiusMax: 50, speed: 0.12, opacity: 0.14, color: '#d97706' },
      // Layer 4: Soft Deep Ambient Mist
      { count: 4, scaleMin: 70, scaleMax: 100, radiusMin: 50, radiusMax: 110, speed: 0.03, opacity: 0.08, color: '#312e81' },
    ];

    return layerConfigs.flatMap((cfg, layerIdx) => {
      return Array.from({ length: cfg.count }).map((_, i) => {
        const angle = (i / cfg.count) * Math.PI * 2 + layerIdx * 1.5;
        const radius = cfg.radiusMin + Math.random() * (cfg.radiusMax - cfg.radiusMin);
        return {
          layerIdx,
          position: new THREE.Vector3(
            Math.cos(angle) * radius,
            (Math.random() - 0.5) * (12 - layerIdx * 2),
            Math.sin(angle) * radius
          ),
          scale: cfg.scaleMin + Math.random() * (cfg.scaleMax - cfg.scaleMin),
          speed: cfg.speed,
          opacity: cfg.opacity,
          color: new THREE.Color(cfg.color),
        };
      });
    });
  }, []);

  const materials = useRef<THREE.ShaderMaterial[]>([]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    materials.current.forEach((mat, idx) => {
      if (mat) {
        const speed = layers[idx]?.speed ?? 0.08;
        mat.uniforms.uTime.value = t * speed;
      }
    });
  });

  if (!showNebula) return null;

  return (
    <group>
      {layers.map((n, i) => (
        <mesh key={i} position={n.position} scale={n.scale}>
          <planeGeometry args={[1, 1]} />
          <shaderMaterial
            ref={(el) => (materials.current[i] = el!)}
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            uniforms={{
              uTime: { value: 0 },
              uColor: { value: n.color },
              uOpacity: { value: Math.min(n.opacity * densityFactor, 1.0) },
            }}
            transparent
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
});
