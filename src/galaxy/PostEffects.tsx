import React from 'react';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useStellarisStore } from '@/store';

export const PostEffects: React.FC = React.memo(() => {
  const { galaxy } = useStellarisStore();

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom
        luminanceThreshold={0.9}
        luminanceSmoothing={0.5}
        mipmapBlur
        intensity={(galaxy?.bloomIntensity ?? 1.5) * 0.55}
      />
    </EffectComposer>
  );
});
