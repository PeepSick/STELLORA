import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useStellarisStore } from '@/store';

export const ConnectionLines: React.FC = React.memo(() => {
  const { connections, gitConnections, nodes, galaxy, hoveredNodeId, selectedNodeId } = useStellarisStore();
  const showConnections = galaxy?.showConnections ?? true;

  const lines = useMemo(() => {
    if (!showConnections) return [];
    
    return [...connections, ...gitConnections].map((conn, idx) => {
      const source = nodes.find(n => n.id === conn.source);
      const target = nodes.find(n => n.id === conn.target);
      if (!source || !target || !source.position || !target.position) return null;

      const p1 = new THREE.Vector3(...source.position);
      const p2 = new THREE.Vector3(...target.position);
      const distance = p1.distanceTo(p2);
      
      const midPoint = p1.clone().lerp(p2, 0.5);
      midPoint.y += distance * 0.2;

      const curve = new THREE.QuadraticBezierCurve3(p1, midPoint, p2);
      const points = curve.getPoints(50);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);

      const isSelectedConn = source.id === selectedNodeId || target.id === selectedNodeId;
      const isHoveredConn = source.id === hoveredNodeId || target.id === hoveredNodeId;

      const isHighlighted = isSelectedConn || isHoveredConn;
      const opacity = isSelectedConn ? 0.95 : isHoveredConn ? 0.75 : 0.18;
      const color = isSelectedConn ? '#65d7ff' : isHoveredConn ? '#a88bff' : '#334155';

      return {
        id: `${conn.source}-${conn.target}-${idx}`,
        geometry,
        color,
        opacity,
        isSelectedConn,
      };
    }).filter((l): l is NonNullable<typeof l> => l !== null);
  }, [connections, gitConnections, nodes, showConnections, hoveredNodeId, selectedNodeId]);

  if (!showConnections) return null;

  return (
    <group>
      {lines.map((line) => (
        <primitive
          key={line.id}
          object={new THREE.Line(
            line.geometry,
            new THREE.LineBasicMaterial({
              color: line.color,
              transparent: true,
              opacity: line.opacity,
              blending: THREE.AdditiveBlending,
              depthWrite: false,
            })
          )}
        />
      ))}
    </group>
  );
});

