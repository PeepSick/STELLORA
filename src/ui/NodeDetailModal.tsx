import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Tag, Link2, Folder, Zap, Sparkles } from 'lucide-react';
import { useStellarisStore } from '@/store';
import { NODE_VISUALS } from '@/types';

export const NodeDetailModal: React.FC = () => {
  const { selectedNodeId, selectNode, getSelectedNode, getConnectedNodes, focusOnNode } = useStellarisStore();
  const selectedNode = getSelectedNode();
  const connectedNodes = selectedNodeId ? getConnectedNodes(selectedNodeId) : [];

  if (!selectedNodeId || !selectedNode) return null;

  const nodeVisual = NODE_VISUALS[selectedNode.type] || { color: '#a88bff' };
  const primaryColor = nodeVisual.color;
  const rawContent = (selectedNode.metadata?.rawMarkdown as string) || selectedNode.description || '';

  // Render raw markdown line-by-line with wikilink parsing [[Link]]
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Header # Title
      if (line.startsWith('# ')) {
        return (
          <h2 key={idx} className="text-base font-bold text-white tracking-wide border-b border-white/10 pb-1.5 my-2 font-sans">
            {line.replace('# ', '')}
          </h2>
        );
      }
      // Subheader ## Title
      if (line.startsWith('## ')) {
        return (
          <h3 key={idx} className="text-xs font-bold text-purple-300 tracking-wide my-1.5 font-sans">
            {line.replace('## ', '')}
          </h3>
        );
      }
      // Empty line
      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />;
      }
      // List items (- or *)
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const itemText = line.trim().substring(2);
        return (
          <li key={idx} className="ml-3 text-slate-300 text-[11px] leading-relaxed font-mono list-disc my-0.5">
            {renderWikiLinks(itemText)}
          </li>
        );
      }
      // Paragraph
      return (
        <p key={idx} className="text-slate-300 text-[11px] leading-relaxed font-mono my-1">
          {renderWikiLinks(line)}
        </p>
      );
    });
  };

  // Convert [[WikiLinks]] into clickable glowing buttons
  const renderWikiLinks = (text: string) => {
    const parts = text.split(/(\[\[.*?\]\])/g);
    return parts.map((part, i) => {
      if (part.startsWith('[[') && part.endsWith(']]')) {
        const linkName = part.substring(2, part.length - 2);
        return (
          <button
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              const { nodes: storeNodes, searchIndex } = useStellarisStore.getState();
              const allNodes = [...storeNodes, ...searchIndex];
              const matchedNode = allNodes.find(
                (n) => n.title.toLowerCase() === linkName.toLowerCase() || n.id === linkName.toLowerCase().replace(/[^a-z0-9]/g, '-')
              );
              if (matchedNode) {
                selectNode(matchedNode.id);
                focusOnNode(matchedNode.id);
              }
            }}
            className="inline-flex items-center gap-0.5 px-1 py-0.5 mx-0.5 rounded bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 hover:text-white border border-purple-500/40 font-semibold cursor-pointer transition-all text-[10px]"
          >
            <Sparkles size={9} className="text-amber-300" />
            <span>{linkName}</span>
          </button>
        );
      }
      return part;
    });
  };

  return (
    <AnimatePresence>
      {/* 
        NO HEAVY BACKDROP WALL!
        Anchored on the RIGHT SIDE between OverviewPanel (top-20) and ContextPanel (bottom-12),
        leaving the center 3D camera zoom & galaxy 100% visible!
      */}
      <motion.div
        initial={{ x: 60, opacity: 0, scale: 0.95 }}
        animate={{ x: 0, opacity: 1, scale: 1 }}
        exit={{ x: 60, opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 240 }}
        className="fixed top-[185px] right-6 bottom-[260px] w-[300px] z-40 bg-[#0a0b18]/50 backdrop-blur-2xl border border-white/20 rounded-2xl p-4 shadow-[0_20px_60px_rgba(0,0,0,0.6)] flex flex-col font-mono pointer-events-auto relative overflow-hidden"
        style={{
          boxShadow: `0 0 30px ${primaryColor}25, 0 20px 60px rgba(0,0,0,0.8)`
        }}
      >
        {/* Glowing Top Accent Line */}
        <div
          className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r"
          style={{
            backgroundImage: `linear-gradient(to right, ${primaryColor}, #65d7ff, ${primaryColor})`
          }}
        />

        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-2.5 mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center border shadow-sm shrink-0"
              style={{
                backgroundColor: `${primaryColor}22`,
                borderColor: `${primaryColor}66`,
                color: primaryColor,
              }}
            >
              <FileText size={16} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-xs font-bold text-white font-sans tracking-wide truncate max-w-[170px]">
                  {selectedNode.title}
                </h2>
                <span
                  className="px-1.5 py-0.5 rounded text-[8px] font-bold border uppercase tracking-wider shrink-0"
                  style={{
                    backgroundColor: `${primaryColor}22`,
                    color: primaryColor,
                    borderColor: `${primaryColor}44`
                  }}
                >
                  {selectedNode.type}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[9px] text-slate-400 mt-0.5">
                <span className="flex items-center gap-1">
                  <Folder size={10} className="text-purple-400" />
                  <span className="uppercase truncate max-w-[100px]">{String(selectedNode.metadata?.folder || 'General')}</span>
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => selectNode(null)}
            className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all shrink-0 ml-1"
            title="Close popup (Esc)"
          >
            <X size={14} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-2">
          {renderMarkdown(rawContent)}
        </div>

        {/* Modal Footer: Tags & Connected Nodes */}
        <div className="border-t border-white/10 pt-2.5 mt-2 space-y-2 shrink-0">
          {/* Connected Nodes Row */}
          {connectedNodes.length > 0 && (
            <div className="space-y-1">
              <span className="text-[9px] text-slate-400 font-semibold uppercase flex items-center gap-1">
                <Link2 size={11} className="text-cyan-400" />
                <span>CONNECTED NODES ({connectedNodes.length})</span>
              </span>
              <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto custom-scrollbar">
                {connectedNodes.map((connNode) => (
                  <button
                    key={connNode.id}
                    onClick={() => {
                      selectNode(connNode.id);
                      focusOnNode(connNode.id);
                    }}
                    className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-400/40 text-[10px] text-slate-200 hover:text-white flex items-center gap-1 transition-all group"
                  >
                    <span className="w-1 h-1 rounded-full bg-purple-400 group-hover:scale-125 transition-transform" />
                    <span className="truncate max-w-[120px]">{connNode.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Row Info */}
          <div className="flex items-center justify-between text-[9px] text-slate-400 pt-0.5">
            <div className="flex items-center gap-1">
              <Zap size={10} className="text-amber-400" />
              <span>IMPORTANCE: {selectedNode.importance}/5</span>
            </div>
            <div className="flex items-center gap-1 truncate max-w-[120px]">
              <Tag size={10} className="text-slate-500" />
              <span className="truncate">#{selectedNode.tags?.[0] || 'general'}</span>
            </div>
          </div>
        </div>

      </motion.div>
    </AnimatePresence>
  );
};
