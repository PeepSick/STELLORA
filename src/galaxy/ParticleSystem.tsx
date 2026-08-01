import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStellarisStore } from '@/store';

export const ParticleSystem: React.FC = React.memo(() => {
  const pointsRef = useRef<THREE.Points>(null);
  const { galaxy } = useStellarisStore();
  const particleCount = galaxy?.particleCount ?? 10000;
  const showParticles = galaxy?.showParticles ?? true;

  const [positions, phases] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const pha = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 200;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 200;
      pha[i] = Math.random() * Math.PI * 2;
    }
    return [pos, pha];
  }, [particleCount]);

  useFrame((state) => {
    if (!pointsRef.current || !showParticles) return;
    const time = state.clock.elapsedTime;
    const geometry = pointsRef.current.geometry;
    const positions = geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3 + 1] += Math.sin(time + phases[i]) * 0.02;
    }
    geometry.attributes.position.needsUpdate = true;
    pointsRef.current.rotation.y = time * 0.05;
  });

  if (!showParticles) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.2}
        color="#ffffff"
        transparent
        opacity={0.4}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
});
