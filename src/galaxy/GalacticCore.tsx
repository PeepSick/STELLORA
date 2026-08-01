import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStellarisStore } from '@/store';

export const GalacticCore: React.FC = React.memo(() => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Sprite>(null);
  const outerGlowRef = useRef<THREE.Sprite>(null);
  const superGlowRef = useRef<THREE.Sprite>(null);
  // Default 1.85 reproduces the original hardcoded look; slider scales from there
  const coreBrightness = useStellarisStore((s) => s.galaxy?.coreBrightness ?? 1.85);
  const brightnessFactor = coreBrightness / 1.85;

  // Generate ultra-high quality warm cinematic radial gradient
  const glowTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
    gradient.addColorStop(0.00, 'rgba(255, 255, 255, 1.0)');     // Pure Blazing White Center
    gradient.addColorStop(0.08, 'rgba(255, 244, 200, 0.95)');   // Warm Sun White
    gradient.addColorStop(0.20, 'rgba(255, 190, 80, 0.85)');    // Intense Golden Amber
    gradient.addColorStop(0.40, 'rgba(235, 100, 40, 0.50)');    // Deep Radiant Orange
    gradient.addColorStop(0.65, 'rgba(147, 51, 234, 0.25)');    // Cosmic Royal Purple
    gradient.addColorStop(0.88, 'rgba(79, 70, 229, 0.08)');     // Deep Indigo Flare
    gradient.addColorStop(1.00, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    return new THREE.CanvasTexture(canvas);
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.12;
      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = (3.5 + Math.sin(t * 2.0) * 0.5) * brightnessFactor;
    }
    if (glowRef.current) {
      const s = (38 + Math.sin(t * 1.8) * 4) * brightnessFactor;
      glowRef.current.scale.set(s, s, 1);
      (glowRef.current.material as THREE.SpriteMaterial).opacity = Math.min(0.95 * brightnessFactor, 1.0);
    }
    if (outerGlowRef.current) {
      const s = (75 + Math.cos(t * 1.2) * 8) * brightnessFactor;
      outerGlowRef.current.scale.set(s, s, 1);
    }
    if (superGlowRef.current) {
      const s = (120 + Math.sin(t * 0.8) * 12) * brightnessFactor;
      superGlowRef.current.scale.set(s, s, 1);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Central Blazing Core Sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[2.8, 64, 64]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffe082"
          emissiveIntensity={4.0}
          roughness={0.0}
          metalness={0.9}
          toneMapped={false}
        />
      </mesh>

      {/* Core Inner Hot Flare */}
      <sprite ref={glowRef}>
        <spriteMaterial
          map={glowTexture}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          transparent
          opacity={0.95}
        />
      </sprite>

      {/* Mid Golden Ambient Halo */}
      <sprite ref={outerGlowRef}>
        <spriteMaterial
          map={glowTexture}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          transparent
          opacity={0.65}
        />
      </sprite>

      {/* Giant Space Opera Deep Purple/Amber Volumetric Glow */}
      <sprite ref={superGlowRef}>
        <spriteMaterial
          map={glowTexture}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          transparent
          opacity={0.35}
        />
      </sprite>
    </group>
  );
});
