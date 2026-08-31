import { useEffect, useState } from 'react';
import { StellarisGalaxy } from './StellarisGalaxy';
import { mockNodes, mockConnections, financeSearchIndex } from '@/data/mockNodes';
import { loadGalleryNodesAndConnections } from '@/data/loadGalleryData';
import { loadMusicNodes } from '@/data/loadMusicData';
import { seedDemoContentOnce } from '@/data/seedDemoContent';
import { useStellarisStore } from '@/store';
import type { StellarisNode, StellarisConnection } from '@/types';
// index.css (Tailwind) is imported once in main.tsx, ahead of either lazy
// route, so both App and Landing get styled — this file used to import it
// itself, which meant Landing (bundled separately, never touching App.tsx)
// rendered with zero CSS at all.

// Runs once at module load, synchronously, before anything reads localStorage
// for photo/memory content — see seedDemoContent.ts for why this exists.
seedDemoContentOnce();

/**
 * Standalone Demo Application
 *
 * Renders the full Stellora Galaxy — either the curated Knowledge graph
 * (business markdown notes) or the Stellora photo/memory gallery, depending
 * on the Galaxy Source toggle in the left panel.
 * Run with: npm run dev
 */
export default function App() {
  // index.html's <title> is tuned for the landing page (the more common
  // entry point for SEO/sharing) — restore the app's own descriptive title
  // once the actual Stellora experience mounts.
  useEffect(() => {
    document.title = 'Stellora — Living Knowledge & Memory Galaxy';
  }, []);

  const galaxyProvider = useStellarisStore((s) => s.galaxyProvider);
  const showMusic = useStellarisStore((s) => s.features.musicGalaxy);
  const setMusicNodes = useStellarisStore((s) => s.setMusicNodes);
  const language = useStellarisStore((s) => s.features.language);
  const [galleryData, setGalleryData] = useState<{ nodes: StellarisNode[]; connections: StellarisConnection[] } | null>(null);
  const [galleryDataLang, setGalleryDataLang] = useState<typeof language | null>(null);

  useEffect(() => {
    // Date labels/day summaries are baked in at load time (resolveLanguage()
    // is read once per node, not reactively), so switching language in
    // Settings previously left stale-locale text until a manual page reload.
    // Re-load whenever the resolved language actually changes; otherwise
    // reuse the cached data instead of re-parsing EXIF on every provider toggle.
    if ((galaxyProvider === 'stellora' || galaxyProvider === 'all') && (!galleryData || galleryDataLang !== language)) {
      loadGalleryNodesAndConnections().then((data) => {
        setGalleryData(data);
        setGalleryDataLang(language);
      });
    }
  }, [galaxyProvider, language, galleryData, galleryDataLang]);

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
