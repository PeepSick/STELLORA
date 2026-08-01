import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStellarisStore } from '@/store';

export const OrbitRings: React.FC = React.memo(() => {
  const groupRef = useRef<THREE.Group>(null);
  const showOrbitLines = useStellarisStore((s) => s.galaxy?.showOrbitLines ?? true);

  const ringGeometries = useMemo(() => {
    const radii = [22, 40, 60, 82, 105, 130];
    return radii.map((radius) => {
      const points: THREE.Vector3[] = [];
      const segments = 128;
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(theta) * radius, 0, Math.sin(theta) * radius * 0.88)); // slightly elliptical
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points);

      // Create tick marks
      const tickPoints: THREE.Vector3[] = [];
      const numTicks = 36;
      for (let i = 0; i < numTicks; i++) {
        const theta = (i / numTicks) * Math.PI * 2;
        const cx = Math.cos(theta) * radius;
        const cz = Math.sin(theta) * radius * 0.88;
        const tickLength = 1.2;
        const nx = Math.cos(theta) * (radius + tickLength);
        const nz = Math.sin(theta) * (radius + tickLength) * 0.88;
        tickPoints.push(new THREE.Vector3(cx, 0, cz));
        tickPoints.push(new THREE.Vector3(nx, 0, nz));
      }
      const tickGeometry = new THREE.BufferGeometry().setFromPoints(tickPoints);

      return { radius, geometry, tickGeometry };
    });
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.015;
    }
  });

  if (!showOrbitLines) return null;

  return (
    <group ref={groupRef} rotation={[0, 0, 0]}>
      {ringGeometries.map((ring, idx) => (
        <group key={idx}>
          {/* Main ring line */}
          <primitive
            object={
              new THREE.Line(
                ring.geometry,
                new THREE.LineBasicMaterial({
                  color: idx % 2 === 0 ? '#7c3aed' : '#d97706',
                  transparent: true,
                  opacity: 0.18 + idx * 0.03,
                  blending: THREE.AdditiveBlending,
                  depthWrite: false,
                })
              )
            }
          />
          {/* Tick mark lines */}
          <primitive
            object={
              new THREE.LineSegments(
                ring.tickGeometry,
                new THREE.LineBasicMaterial({
                  color: '#a855f7',
                  transparent: true,
                  opacity: 0.15,
                  blending: THREE.AdditiveBlending,
                  depthWrite: false,
                })
              )
            }
          />
        </group>
      ))}
    </group>
  );
});
