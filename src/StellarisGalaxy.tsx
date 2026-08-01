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
import { useStellarisStore } from '@/store';
import { calculateNodePositions } from '@/utils/galaxyMath';
import type { StellarisGalaxyProps } from '@/types';

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

  const [showIntro, setShowIntro] = useState(true);

  useKeyboard();
  useIdleDetection();

  useEffect(() => {
    const positionedNodes = calculateNodePositions(nodes);
    setNodes(positionedNodes);
  }, [nodes, setNodes]);

  useEffect(() => {
    setConnections(connections);
  }, [connections, setConnections]);

  useEffect(() => {
    setSearchIndex(searchIndexNodes);
  }, [searchIndexNodes, setSearchIndex]);

  useEffect(() => {
    if (config) setConfig(config);
  }, [config, setConfig]);

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
        <div className="pointer-events-auto">
          <ControlPanel />
        </div>

        {/* Right Top Overview Panel */}
        <div className="pointer-events-auto">
          <OverviewPanel />
        </div>

        {/* Right Bottom Unified Context & Node Details Panel */}
        <div className="pointer-events-auto">
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
