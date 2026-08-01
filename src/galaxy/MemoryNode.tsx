import React, { Suspense } from 'react';
import { Billboard, Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useStellarisStore } from '@/store';
import type { StellarisNode, StellorMemoryMetadata } from '@/types';

interface MemoryNodeProps {
  node: StellarisNode;
  scale: number;
  isSelected: boolean;
  isHovered: boolean;
  dimFactor: number;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  onSelect: () => void;
}

const MemoryCover: React.FC<MemoryNodeProps> = ({ node, scale, isSelected, isHovered, dimFactor, onHoverStart, onHoverEnd, onSelect }) => {
  const meta = node.metadata as unknown as StellorMemoryMetadata;
  const activePhotoIndex = useStellarisStore((s) => s.activePhotoIndex);
  const setActivePhotoIndex = useStellarisStore((s) => s.setActivePhotoIndex);
  // Only the selected node's cover follows the shared slider index — others always show photo 1
  const coverIndex = isSelected ? Math.min(activePhotoIndex, meta.photos.length - 1) : 0;
  const coverUrl = meta.photos[coverIndex]?.imageUrl;
  const texture = useTexture(coverUrl);
  const image = texture.image as { width: number; height: number } | undefined;
  const aspect = image && image.width && image.height ? image.width / image.height : 1;
  const frameSize = scale * 2.4;
  const planeW = aspect >= 1 ? frameSize : frameSize * aspect;
  const planeH = aspect >= 1 ? frameSize / aspect : frameSize;

  const goto = (delta: number) => {
    const next = ((coverIndex + delta) % meta.photos.length + meta.photos.length) % meta.photos.length;
    setActivePhotoIndex(next);
  };

  return (
    <Billboard>
      {/* Cover photo card — represents the whole day's gallery */}
      <mesh
        scale={[planeW, planeH, 1]}
        onPointerOver={(e) => { e.stopPropagation(); onHoverStart(); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { onHoverEnd(); document.body.style.cursor = 'auto'; }}
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
      >
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={texture} toneMapped={false} transparent opacity={dimFactor} />
      </mesh>

      {/* Warm frame outline — brighter when selected/hovered */}
      <mesh scale={[planeW * 1.06, planeH * 1.06, 1]} position={[0, 0, -0.01]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          color={'#FDE68A'}
          transparent
          opacity={(isSelected ? 0.9 : isHovered ? 0.7 : 0.45) * dimFactor}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Stacked-photos cue behind the cover — only when the day has more than one photo */}
      {meta.photos.length > 1 && (
        <>
          <mesh scale={[planeW * 0.94, planeH * 0.94, 1]} position={[planeW * 0.05, -planeH * 0.05, -0.03]}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial color={'#1a1420'} transparent opacity={0.9 * dimFactor} />
          </mesh>
          {meta.photos.length > 2 && (
            <mesh scale={[planeW * 0.88, planeH * 0.88, 1]} position={[planeW * 0.1, -planeH * 0.1, -0.05]}>
              <planeGeometry args={[1, 1]} />
              <meshBasicMaterial color={'#120e18'} transparent opacity={0.85 * dimFactor} />
            </mesh>
          )}
          <Html center position={[planeW * 0.42, planeH * 0.42, 0]} style={{ pointerEvents: 'none' }} zIndexRange={[10, 0]}>
            <div className="px-1.5 py-0.5 rounded-full bg-black/85 border border-amber-300/50 text-[9px] text-amber-200 font-mono font-bold whitespace-nowrap flex items-center gap-0.5">
              📷{meta.photos.length}
            </div>
          </Html>
        </>
      )}

      {/* Prev/next arrows — only for the selected node, keeps the 3D cover in sync with the panel slider */}
      {isSelected && meta.photos.length > 1 && (
        <>
          <Html center position={[-planeW / 2 - scale * 0.35, 0, 0]} style={{ pointerEvents: 'none' }} zIndexRange={[5, 0]}>
            <button
              onClick={(e) => { e.stopPropagation(); goto(-1); }}
              className="w-6 h-6 rounded-full bg-black/70 border border-white/20 flex items-center justify-center text-white hover:bg-black/90"
              style={{ pointerEvents: 'auto' }}
            >
              ‹
            </button>
          </Html>
          <Html center position={[planeW / 2 + scale * 0.35, 0, 0]} style={{ pointerEvents: 'none' }} zIndexRange={[5, 0]}>
            <button
              onClick={(e) => { e.stopPropagation(); goto(1); }}
              className="w-6 h-6 rounded-full bg-black/70 border border-white/20 flex items-center justify-center text-white hover:bg-black/90"
              style={{ pointerEvents: 'auto' }}
            >
              ›
            </button>
          </Html>
        </>
      )}
    </Billboard>
  );
};

export const MemoryNode: React.FC<MemoryNodeProps> = (props) => {
  const { node, scale, isHovered } = props;
  const meta = node.metadata as unknown as StellorMemoryMetadata;

  return (
    <group position={node.position}>
      <Suspense fallback={null}>
        <MemoryCover {...props} />
      </Suspense>

      {isHovered && (
        <Html center position={[0, -scale * 1.6, 0]} style={{ pointerEvents: 'none' }}>
          <div className="px-2 py-1 rounded-md bg-black/80 backdrop-blur-sm border border-white/20 text-[11px] text-white font-mono whitespace-nowrap shadow-lg">
            {node.title} · {meta.photos.length} foto
          </div>
        </Html>
      )}
    </group>
  );
};
