import { useEffect, useState } from 'react';
import { StellarisGalaxy } from './StellarisGalaxy';
import { mockNodes, mockConnections, financeSearchIndex } from '@/data/mockNodes';
import { loadGalleryNodesAndConnections } from '@/data/loadGalleryData';
import { loadMusicNodes } from '@/data/loadMusicData';
import { useStellarisStore } from '@/store';
import type { StellarisNode, StellarisConnection } from '@/types';
import './index.css';

/**
 * Standalone Demo Application
 *
 * Renders the full Stellora Galaxy — either the curated Knowledge graph
 * (business markdown notes) or the Stellora photo/memory gallery, depending
 * on the Galaxy Source toggle in the left panel.
 * Run with: npm run dev
 */
export default function App() {
  const galaxyProvider = useStellarisStore((s) => s.galaxyProvider);
  const showMusic = useStellarisStore((s) => s.features.musicGalaxy);
  const setMusicNodes = useStellarisStore((s) => s.setMusicNodes);
  const [galleryData, setGalleryData] = useState<{ nodes: StellarisNode[]; connections: StellarisConnection[] } | null>(null);

  useEffect(() => {
    if ((galaxyProvider === 'stellora' || galaxyProvider === 'all') && !galleryData) {
      loadGalleryNodesAndConnections().then(setGalleryData);
    }
  }, [galaxyProvider, galleryData]);

  // Music Galaxy: auto-discover local audio files and push them into the store
  // when the feature is enabled (gallery-style auto-loading).
  useEffect(() => {
    if (showMusic) setMusicNodes(loadMusicNodes());
    else setMusicNodes([]);
  }, [showMusic, setMusicNodes]);

  const handleNodeSelect = (node: StellarisNode) => {
    console.log('[Stellora] Node selected:', node.title, node);
  };

  const handleNodeAction = (action: string, node: StellarisNode) => {
    console.log('[Stellora] Node action:', action, node.title);
  };

  const handleSearch = (query: string) => {
    console.log('[Stellora] Search:', query);
  };

  const handleDockClick = (itemId: string) => {
    console.log('[Stellora] Dock click:', itemId);
  };

  // ALL mode: both graphs rendered together — same 3D galaxy, both node sets active at once
  const activeNodes =
    galaxyProvider === 'stellora'
      ? (galleryData?.nodes ?? [])
      : galaxyProvider === 'all'
        ? [...mockNodes, ...(galleryData?.nodes ?? [])]
        : mockNodes;
  const activeConnections =
    galaxyProvider === 'stellora'
      ? (galleryData?.connections ?? [])
      : galaxyProvider === 'all'
        ? [...mockConnections, ...(galleryData?.connections ?? [])]
        : mockConnections;

  return (
    <div className="w-screen h-screen bg-[#070811]">
      <StellarisGalaxy
        key={galaxyProvider}
        nodes={activeNodes}
        connections={activeConnections}
        searchIndexNodes={galaxyProvider === 'knowledge' || galaxyProvider === 'all' ? financeSearchIndex : []}
        config={{
          showSearch: true,
          showLeftPanel: true,
          showRightPanel: true,
          showDock: true,
          showUniverseIntro: false,
          enableSound: true,
          enableIdleAnimation: true,
        }}
        onNodeSelect={handleNodeSelect}
        onNodeAction={handleNodeAction}
        onSearch={handleSearch}
        onDockItemClick={handleDockClick}
      />
    </div>
  );
}
