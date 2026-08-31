import React, { useEffect, useState } from 'react';
import { GalaxyCanvas } from '@/galaxy/GalaxyCanvas';
import { TopHeader } from '@/ui/TopHeader';
import { CommandPalette } from '@/ui/CommandPalette';
import { ControlPanel } from '@/ui/ControlPanel';
import { OverviewPanel } from '@/ui/OverviewPanel';
import { ContextPanel } from '@/ui/ContextPanel';
import { BottomDock } from '@/ui/BottomDock';
import { DockPanels } from '@/ui/DockPanels';
import { ChatPanel } from '@/ui/ChatPanel';
import { StatusBar } from '@/ui/StatusBar';
import { CinematicIntro } from '@/ui/CinematicIntro';
import { useKeyboard } from '@/hooks/useKeyboard';
import { useIdleDetection } from '@/hooks/useIdleDetection';
import { useCollabSync } from '@/hooks/useCollab';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { useMusicController } from '@/hooks/useMusicController';
import { useStellarisStore } from '@/store';
import { calculateNodePositions } from '@/utils/galaxyMath';
import { applyTheme } from '@/utils/themes';
import type { StellarisGalaxyProps, StellarisNode } from '@/types';

/**
 * StellarisGalaxy — Main exported component
 *
 * 1:1 Pixel-Perfect 3D Knowledge Universe & Procedural Engine UI.
 */
export function StellarisGalaxy({
  nodes,
  connections = [],
  searchIndexNodes = [],
  config = {},
  onNodeSelect,
  onNodeHover,
  onNodeAction,
  onSearch,
  onDockItemClick,
  fullscreen = false,
  className = '',
}: StellarisGalaxyProps) {
  const {
    setNodes,
    setConnections,
    setSearchIndex,
    setConfig,
    setFullscreen,
    isSearchOpen,
    selectedNodeId,
    getSelectedNode,
    activeDockTab,
    isChatOpen,
  } = useStellarisStore();

  const showFinance3D = useStellarisStore((s) => s.features.showFinance3D);
  const showMusic = useStellarisStore((s) => s.features.musicGalaxy);
  const showGit = useStellarisStore((s) => s.features.gitGalaxy);
  const musicNodes = useStellarisStore((s) => s.musicNodes);
  const gitNodes = useStellarisStore((s) => s.gitNodes);
  const themePreset = useStellarisStore((s) => s.features.themePreset);

  const [showIntro, setShowIntro] = useState(true);

  useKeyboard();
  useIdleDetection();
  useCollabSync();
  useAudioEngine();
  useMusicController();

  useEffect(() => {
    // Merge optional node sources into the spatial graph based on their flags.
    // Finance: shrink + drop internal links (avoids whiteout). Music/Git: as-is.
    const extra: StellarisNode[] = [];
    if (showFinance3D) {
      extra.push(...searchIndexNodes.map((n) => ({ ...n, connections: [], size: 0.5, importance: 1 })));
    }
    if (showMusic) extra.push(...musicNodes);
    if (showGit) extra.push(...gitNodes);
    const toRender = extra.length ? [...nodes, ...extra] : nodes;
    const positionedNodes = calculateNodePositions(toRender);
    setNodes(positionedNodes);
  }, [nodes, searchIndexNodes, musicNodes, gitNodes, showFinance3D, showMusic, showGit, setNodes]);

  useEffect(() => {
    // Finance nodes live in `nodes` (spatial) when the feature is on, so keep
    // them out of the search-only index to avoid duplicates there.
    setSearchIndex(showFinance3D ? [] : searchIndexNodes);
  }, [searchIndexNodes, showFinance3D, setSearchIndex]);

  useEffect(() => {
    if (config) setConfig(config);
  }, [config, setConfig]);

  // Theme engine — apply the selected preset whenever it changes (Phase 3)
  useEffect(() => {
    applyTheme(themePreset);
  }, [themePreset]);

  useEffect(() => {
    setFullscreen(fullscreen);
  }, [fullscreen, setFullscreen]);

  useEffect(() => {
    if (selectedNodeId && onNodeSelect) {
      const node = getSelectedNode();
      if (node) onNodeSelect(node);
    }
  }, [selectedNodeId, onNodeSelect, getSelectedNode]);

  return (
    <div
      className={`stellaris-galaxy relative w-full h-full overflow-hidden bg-[#070811] ${className}`}
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Item 17: Premium Cinematic Boot Sequence Intro */}
      {showIntro && <CinematicIntro onComplete={() => setShowIntro(false)} />}

      {/* 3D Galaxy Canvas — fills entire viewport */}
      <div className="absolute inset-0 z-0">
        <GalaxyCanvas />
      </div>

      {/* UI Overlay Layer matching screenshot 1:1 */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* Top Bar Header */}
        <div className="pointer-events-auto">
          <TopHeader />
        </div>

        {/* Command Palette Modal */}
        {isSearchOpen && (
          <div className="pointer-events-auto">
            <CommandPalette />
          </div>
        )}

        {/* Left Control Panel (Galaxy Controls & Presets) */}
        <div className="pointer-events-auto left-panel-wrapper">
          <ControlPanel />
        </div>

        {/* Right Top Overview Panel */}
        <div className="pointer-events-auto right-panel-wrapper">
          <OverviewPanel />
        </div>

        {/* Right Bottom Unified Context & Node Details Panel */}
        <div className="pointer-events-auto right-panel-wrapper">
          <ContextPanel />
        </div>

        {/* Bottom Dock Navigation */}
        <div className="pointer-events-auto">
          <BottomDock />
        </div>

        {/* Bottom Status Bar */}
        <div className="pointer-events-auto">
          <StatusBar />
        </div>

        {/* Dock tab overlay (Systems/Orbs/Analytics/Archive/Settings/Dashboard) */}
        {activeDockTab !== 'galaxy' && (
          <div className="pointer-events-auto">
            <DockPanels />
          </div>
        )}

        {/* AI Chat overlay */}
        {isChatOpen && (
          <div className="pointer-events-auto">
            <ChatPanel />
          </div>
        )}
      </div>
    </div>
  );
}

export default StellarisGalaxy;
