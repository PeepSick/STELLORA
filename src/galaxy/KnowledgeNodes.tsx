import React, { useMemo } from 'react';
import { Billboard, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useStellarisStore } from '@/store';
import { NODE_VISUALS } from '@/types';
import { audioManager } from '@/utils/audio';
import type { StellorMemoryMetadata } from '@/types';
import { MemoryNode } from './MemoryNode';
import { computeMemoryScore, memoryScoreToScaleFactor } from '@/utils/memoryScore';
import { getNodeSourceLabelKey } from '@/utils/nodeSource';
import { isSourceMismatchFlagged, toggleSourceMismatchFlag } from '@/hooks/useSourceMismatch';
import { useTranslation } from '@/i18n';

// Scales the base 0.45 silhouette up to a clearly visible "orb" marker
const NODE_SCALE_MULTIPLIER = 1.5;

export const KnowledgeNodes: React.FC = React.memo(() => {
  const { nodes, selectedNodeId, hoveredNodeId, galaxy, selectNode, hoverNode, focusOnNode } = useStellarisStore();
  const nodeSize = galaxy?.nodeSize ?? 1.0;
  const { t } = useTranslation();
  // Bumped on every mismatch-flag toggle so the hover tag re-reads localStorage
  const [mismatchVersion, setMismatchVersion] = React.useState(0);

  // Generate smooth circular radial glow texture for sprites (fixes square box artifact!)
  const glowTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
    gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.85)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.35)');
    gradient.addColorStop(0.8, 'rgba(255, 255, 255, 0.08)');
    gradient.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(canvas);
  }, []);

  return (
    <group>
      {/* Mini Planetary Energy Systems for each knowledge node */}
      {nodes.map((node) => {
        const isSelected = node.id === selectedNodeId;
        const isHovered = node.id === hoveredNodeId;
        if (!node.position) return null;

        const visualConfig = NODE_VISUALS[node.type];
        const baseScale = (visualConfig?.baseSize || 1.0) * NODE_SCALE_MULTIPLIER;
        let scale = nodeSize * baseScale;

        if (node.importance >= 4) scale *= 1.25;
        if (isSelected) scale *= 1.5;
        else if (isHovered) scale *= 1.2;

        const nodeColor = new THREE.Color(visualConfig?.color || '#a88bff');
        // Hot white-star core color — mostly white with a hint of the node's hue
        const coreColor = nodeColor.clone().lerp(new THREE.Color('#ffffff'), 0.7);
        // Ring reads as a soft light reticle rather than a bold flat outline
        const ringColor = nodeColor.clone().lerp(new THREE.Color('#ffffff'), 0.35);

        const dim = selectedNodeId && !isSelected && !isHovered;
        const dimFactor = dim ? 0.35 : 1.0;

        if (Array.isArray((node.metadata as any)?.photos)) {
          // Memory Score drives star size here instead of the static importance
          // field — photo count + story length + favorite/important/archived mark
          const memoryScore = computeMemoryScore(node.id, node.metadata as unknown as StellorMemoryMetadata);
          scale *= memoryScoreToScaleFactor(memoryScore);
          return (
            <MemoryNode
              key={node.id}
              node={node}
              scale={scale}
              isSelected={isSelected}
              isHovered={isHovered}
              dimFactor={dimFactor}
              onHoverStart={() => { hoverNode(node.id); audioManager.playHover(); }}
              onHoverEnd={() => hoverNode(null)}
              onSelect={() => { selectNode(node.id); focusOnNode(node.id); audioManager.playSelect(); }}
            />
          );
        }

        return (
          <group key={node.id} position={node.position}>
            {/* Invisible hit target — generous click/hover area around the star point */}
            <mesh
              scale={scale * 1.4}
              onPointerOver={(e) => { e.stopPropagation(); hoverNode(node.id); document.body.style.cursor = 'pointer'; audioManager.playHover(); }}
              onPointerOut={() => { hoverNode(null); document.body.style.cursor = 'auto'; }}
              onClick={(e) => { e.stopPropagation(); selectNode(node.id); focusOnNode(node.id); audioManager.playSelect(); }}
              visible={false}
            >
              <sphereGeometry args={[1.0, 8, 8]} />
              <meshBasicMaterial transparent opacity={0} />
            </mesh>

            {/* Tiny hot white-star pinpoint core */}
            <mesh scale={scale * 0.35}>
              <sphereGeometry args={[1.0, 16, 16]} />
              <meshBasicMaterial color={coreColor} toneMapped={false} transparent opacity={dimFactor} />
            </mesh>

            {/* Inner hot glow — bright, tight bloom around the pinpoint */}
            <sprite scale={[scale * 1.8, scale * 1.8, 1]}>
              <spriteMaterial
                map={glowTexture}
                color={coreColor}
                transparent
                opacity={(isSelected ? 1.0 : isHovered ? 0.9 : 0.8) * dimFactor}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </sprite>

            {/* Outer soft ambient bloom, tinted with the node's color */}
            <sprite scale={[scale * 4.2, scale * 4.2, 1]}>
              <spriteMaterial
                map={glowTexture}
                color={nodeColor}
                transparent
                opacity={(isSelected ? 0.5 : isHovered ? 0.4 : 0.28) * dimFactor}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </sprite>

            {/* Camera-facing thin orbit reticle — sits outside the glow with a visible gap */}
            <Billboard>
              <mesh scale={scale * 3.0}>
                <ringGeometry args={[0.94, 1.0, 48]} />
                <meshBasicMaterial
                  color={ringColor}
                  transparent
                  opacity={(isSelected ? 0.85 : isHovered ? 0.65 : 0.4) * dimFactor}
                  side={THREE.DoubleSide}
                  blending={THREE.AdditiveBlending}
                  depthWrite={false}
                />
              </mesh>
            </Billboard>

            {/* Hover label — node title + source tag, floating just below the orb */}
            {isHovered && (() => {
              const flagged = isSourceMismatchFlagged(node.id);
              return (
                <Html center position={[0, -scale * 2.6, 0]} style={{ pointerEvents: 'none' }} zIndexRange={[10, 0]}>
                  <div className="flex flex-col items-center gap-1">
                    <div className="px-2 py-1 rounded-md bg-black/80 backdrop-blur-sm border border-white/20 text-[11px] text-white font-mono whitespace-nowrap shadow-lg">
                      {node.title}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider border whitespace-nowrap ${
                          flagged
                            ? 'bg-amber-500/20 border-amber-400/50 text-amber-200'
                            : 'bg-black/70 border-white/15 text-slate-400'
                        }`}
                      >
                        {t('nodeSourceLabel')}: {t(getNodeSourceLabelKey(node) as any)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSourceMismatchFlag(node.id);
                          setMismatchVersion((v) => v + 1);
                        }}
                        title={t('sourceMismatchQuestion')}
                        className={`px-1.5 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider border whitespace-nowrap transition-colors ${
                          flagged
                            ? 'bg-amber-500/30 border-amber-400/60 text-amber-100'
                            : 'bg-black/70 border-white/15 text-slate-500 hover:text-slate-300 hover:border-white/30'
                        }`}
                        style={{ pointerEvents: 'auto' }}
                      >
                        {flagged ? '🚩 ' + t('sourceMismatchFlagged') : t('sourceMismatchQuestion')}
                      </button>
                    </div>
                  </div>
                </Html>
              );
            })()}
          </group>
        );
      })}

      {/* Target Focus rings for selected/hovered nodes */}
      {nodes.map((node) => {
        const isSelected = node.id === selectedNodeId;
        const isHovered = node.id === hoveredNodeId;
        if (!node.position || (!isSelected && !isHovered)) return null;
        const colorData = NODE_VISUALS[node.type]?.color || '#a88bff';
        const ringScale = isSelected ? 4.2 : 3.3;

        return (
          <group key={`target-${node.id}`} position={node.position}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[ringScale * 0.88, ringScale, 32]} />
              <meshBasicMaterial
                color={colorData}
                transparent
                opacity={isSelected ? 0.8 : 0.55}
                side={THREE.DoubleSide}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
});
