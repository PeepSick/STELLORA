import React from 'react';
import { StarField } from './StarField';
import { GalacticCore } from './GalacticCore';
import { KnowledgeNodes } from './KnowledgeNodes';
import { ConnectionLines } from './ConnectionLines';
import { NebulaSystem } from './NebulaSystem';
import { ParticleSystem } from './ParticleSystem';
import { CameraRig } from './CameraRig';
import { OrbitRings } from './OrbitRings';
import { GalaxyPresence } from './GalaxyPresence';
import { useStellarisStore } from '@/store';

export const GalaxyScene: React.FC = React.memo(() => {
  // Dark matter reads as deep-space haze — more of it, the sooner distant stars fade into fog
  const darkMatter = useStellarisStore((s) => s.galaxy?.darkMatter ?? 0.67);
  const fogDensity = 0.003 + darkMatter * 0.007;

  return (
    <>
      <color attach="background" args={['#070811']} />
      <fogExp2 attach="fog" args={['#070811', fogDensity]} />
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 0, 0]} intensity={3} distance={250} />
      
      <CameraRig />
      <GalacticCore />
      <OrbitRings />
      <StarField />
      <NebulaSystem />
      <ParticleSystem />
      <GalaxyPresence />
      <ConnectionLines />
      <KnowledgeNodes />
    </>
  );
});
