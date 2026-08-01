import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const GalaxyPresence: React.FC = React.memo(() => {
  const meteorRef = useRef<THREE.Line>(null);
  const novaRef = useRef<THREE.Sprite>(null);
  
  const [meteorActive, setMeteorActive] = useState(false);
  const [novaActive, setNovaActive] = useState(false);
  const [novaPos, setNovaPos] = useState<[number, number, number]>([0, 0, 0]);

  // Periodic autonomous space events (every 12-20s)
  useEffect(() => {
    const triggerEvents = () => {
      // 50% chance meteor, 50% chance nova
      if (Math.random() > 0.5) {
        setMeteorActive(true);
        setTimeout(() => setMeteorActive(false), 1200);
      } else {
        const nx = (Math.random() - 0.5) * 160;
        const ny = (Math.random() - 0.5) * 40;
        const nz = (Math.random() - 0.5) * 160;
        setNovaPos([nx, ny, nz]);
        setNovaActive(true);
        setTimeout(() => setNovaActive(false), 2000);
      }
    };

    const interval = setInterval(triggerEvents, 14000);
    return () => clearInterval(interval);
  }, []);

  const meteorGeometry = useMemo(() => {
    const points = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(-15, 5, -20),
    ];
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  const novaTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.3, 'rgba(255, 210, 120, 0.8)');
    gradient.addColorStop(0.7, 'rgba(168, 139, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(canvas);
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (meteorActive && meteorRef.current) {
      meteorRef.current.position.x = Math.sin(t * 4) * 80;
      meteorRef.current.position.y = Math.cos(t * 3) * 30 + 10;
      meteorRef.current.position.z = Math.sin(t * 2) * 80;
    }

    if (novaActive && novaRef.current) {
      const scale = Math.sin((t % 2) * Math.PI) * 20;
      novaRef.current.scale.set(scale, scale, 1);
    }
  });

  return (
    <group>
      {/* Meteor Streak */}
      {meteorActive && (
        <primitive
          ref={meteorRef}
          object={
            new THREE.Line(
              meteorGeometry,
              new THREE.LineBasicMaterial({
                color: '#65d7ff',
                transparent: true,
                opacity: 0.8,
                blending: THREE.AdditiveBlending,
              })
            )
          }
        />
      )}

      {/* Supernova Flare */}
      {novaActive && (
        <sprite ref={novaRef} position={novaPos}>
          <spriteMaterial
            map={novaTexture}
            blending={THREE.AdditiveBlending}
            transparent
            opacity={0.8}
            depthWrite={false}
          />
        </sprite>
      )}
    </group>
  );
});
