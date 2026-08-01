import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import vertexShader from '@/shaders/starfield.vert?raw';
import fragmentShader from '@/shaders/starfield.frag?raw';
import { useStellarisStore } from '@/store';

const GALAXY_RADIUS = 140;
const SPIRAL_TIGHTNESS = 1.65;

export const StarField: React.FC = React.memo(() => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const timeAccRef = useRef<number>(0);
  
  const galaxy = useStellarisStore((state) => state.galaxy);

  const starCount = Math.min(galaxy?.starCount ?? 120000, 400000); // matches slider's max in ControlPanel
  const spiralArms = galaxy?.spiralArms ?? 4;
  const spinVelocity = galaxy?.spinVelocity ?? 2.45;
  const luminosity = galaxy?.luminosity ?? 0.40;
  const coreBrightness = galaxy?.coreBrightness ?? 2.0;
  const preset = galaxy?.preset ?? 'AURELIA';

  // Dynamic geometry calculation responsive to slider changes!
  const [positions, colors, scales, randomness] = useMemo(() => {
    const pos = new Float32Array(starCount * 3);
    const col = new Float32Array(starCount * 3);
    const sca = new Float32Array(starCount);
    const ran = new Float32Array(starCount * 3);

    // Preset color themes - Space Opera Palettes
    let cCenter = new THREE.Color('#fffbf0'); // Warm White
    let cMid    = new THREE.Color('#a855f7'); // Rich Violet
    let cEdge   = new THREE.Color('#4c1d95'); // Deep Purple

    if (preset === 'ORIONIS') {
      cCenter = new THREE.Color('#ffffff');
      cMid    = new THREE.Color('#38bdf8');
      cEdge   = new THREE.Color('#1e1b4b');
    } else if (preset === 'VORATH') {
      cCenter = new THREE.Color('#fff7ed');
      cMid    = new THREE.Color('#f97316');
      cEdge   = new THREE.Color('#881337');
    } else if (preset === 'ZEPHYRA') {
      cCenter = new THREE.Color('#f0fdf4');
      cMid    = new THREE.Color('#10b981');
      cEdge   = new THREE.Color('#064e3b');
    }

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      
      // Power curve concentrates stars near center while maintaining arm volume
      const radius = Math.pow(Math.random(), 1.4) * GALAXY_RADIUS;
      const spinAngle = radius * SPIRAL_TIGHTNESS;
      const armAngle = ((i % spiralArms) / spiralArms) * Math.PI * 2;
      const angle = armAngle + spinAngle;

      const randSpread = Math.random() * 0.35 * (radius + 0.1);

      pos[i3] = Math.cos(angle) * radius;
      pos[i3 + 1] = (Math.random() - 0.5) * (GALAXY_RADIUS - radius) * 0.10; // Thin galactic disk
      pos[i3 + 2] = Math.sin(angle) * radius;

      ran[i3] = (Math.random() - 0.5) * randSpread;
      ran[i3 + 1] = (Math.random() - 0.5) * randSpread * 0.4;
      ran[i3 + 2] = (Math.random() - 0.5) * randSpread;

      const color = new THREE.Color();
      if (radius < GALAXY_RADIUS * 0.3) {
        color.lerpColors(cCenter, cMid, radius / (GALAXY_RADIUS * 0.3));
      } else {
        color.lerpColors(cMid, cEdge, (radius - GALAXY_RADIUS * 0.3) / (GALAXY_RADIUS * 0.7));
      }

      col[i3] = color.r;
      col[i3 + 1] = color.g;
      col[i3 + 2] = color.b;

      // Scale variation for depth
      sca[i] = Math.random() * 0.5 + 0.2;
    }

    return [pos, col, sca, ran];
  }, [starCount, spiralArms, preset]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uSize: { value: luminosity * 3.5 },
    uCoreBrightness: { value: coreBrightness },
  }), [luminosity, coreBrightness]);

  useFrame((_, delta) => {
    timeAccRef.current += delta * spinVelocity * 0.5;
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = timeAccRef.current;
      materialRef.current.uniforms.uSize.value = luminosity * 3.5;
    }
  });

  return (
    <points key={`${starCount}-${spiralArms}-${preset}`}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={starCount}
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-aColor"
          count={starCount}
          args={[colors, 3]}
        />
        <bufferAttribute
          attach="attributes-aScale"
          count={starCount}
          args={[scales, 1]}
        />
        <bufferAttribute
          attach="attributes-aRandomness"
          count={starCount}
          args={[randomness, 3]}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        transparent
      />
    </points>
  );
});
