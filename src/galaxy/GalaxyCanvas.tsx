import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { GalaxyScene } from './GalaxyScene';
import { PostEffects } from './PostEffects';

export const GalaxyCanvas: React.FC = React.memo(() => {
  return (
    <div className="w-full h-screen bg-black">
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
        camera={{ fov: 60, near: 0.1, far: 2000, position: [0, 70, 90] }}
      >
        <PerformanceMonitor>
          <Suspense fallback={null}>
            <GalaxyScene />
            <PostEffects />
          </Suspense>
        </PerformanceMonitor>
      </Canvas>
    </div>
  );
});
