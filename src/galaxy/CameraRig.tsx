import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { useStellarisStore } from '@/store';

export const CameraRig: React.FC = React.memo(() => {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();
  const { selectedNodeId, nodes } = useStellarisStore();

  useEffect(() => {
    if (selectedNodeId) {
      const targetNode = nodes.find(n => n.id === selectedNodeId);
      if (targetNode && targetNode.position && controlsRef.current) {
        const [px, py, pz] = targetNode.position;
        const targetPos = new THREE.Vector3(px, py, pz);
        
        gsap.to(controlsRef.current.target, {
          x: targetPos.x,
          y: targetPos.y,
          z: targetPos.z,
          duration: 1.5,
          ease: 'power3.inOut'
        });

        const camOffset = new THREE.Vector3(10, 5, 10).add(targetPos);
        gsap.to(camera.position, {
          x: camOffset.x,
          y: camOffset.y,
          z: camOffset.z,
          duration: 1.5,
          ease: 'power3.inOut'
        });
      }
    } else {
      if (controlsRef.current) {
        gsap.to(controlsRef.current.target, {
          x: 0, y: 0, z: 0,
          duration: 1.5,
          ease: 'power3.inOut'
        });
        gsap.to(camera.position, {
          x: 0, y: 70, z: 90,
          duration: 1.5,
          ease: 'power3.inOut'
        });
      }
    }
  }, [selectedNodeId, nodes, camera.position]);

  useFrame((state) => {
    if (controlsRef.current) {
      controlsRef.current.update();
    }
    // Apple-Style Camera Breathing (0.2° to 0.4° Lissajous sway)
    if (!selectedNodeId) {
      const t = state.clock.elapsedTime;
      const breatheX = Math.sin(t * 0.3) * 0.08;
      const breatheY = Math.cos(t * 0.25) * 0.05;
      const breatheZ = Math.sin(t * 0.2) * 0.06;

      camera.position.x += breatheX * 0.05;
      camera.position.y += breatheY * 0.05;
      camera.position.z += breatheZ * 0.05;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      maxDistance={300}
      minDistance={5}
    />
  );
});
