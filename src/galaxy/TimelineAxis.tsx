import React from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useStellarisStore } from '@/store';

const AXIS_HALF = 85;

/**
 * Temporal reference axis for Timeline View. When the feature is on, draws a
 * glowing horizontal line on the X axis with year tick marks, anchored so the
 * current year sits at the galactic centre. Purely a spatial guide — it does
 * not reposition nodes, it gives the viewer a time orientation.
 */
export const TimelineAxis: React.FC = React.memo(() => {
  const enabled = useStellarisStore((s) => s.features.timelineView);
  if (!enabled) return null;

  const centerYear = new Date().getFullYear();
  const span = 6; // years each side
  const yearStep = (AXIS_HALF * 2) / (span * 2);

  const ticks: { x: number; year: number }[] = [];
  for (let i = -span; i <= span; i++) {
    ticks.push({ x: i * yearStep, year: centerYear + i });
  }

  return (
    <group>
      {/* Axis line */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.15, 0.15, AXIS_HALF * 2, 8]} />
        <meshBasicMaterial color="#65D7FF" transparent opacity={0.35} blending={THREE.AdditiveBlending} />
      </mesh>

      {ticks.map((tick) => (
        <group key={tick.year} position={[tick.x, 0, 0]}>
          <mesh>
            <sphereGeometry args={[0.6, 12, 12]} />
            <meshBasicMaterial color="#65D7FF" transparent opacity={0.8} blending={THREE.AdditiveBlending} />
          </mesh>
          <Text
            position={[0, 3, 0]}
            fontSize={3}
            color="#65D7FF"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.1}
            outlineColor="#000000"
          >
            {tick.year}
          </Text>
        </group>
      ))}
    </group>
  );
});
