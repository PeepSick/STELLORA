import React, { useRef, useEffect } from 'react';
import { ArrowRight, Activity, ShieldCheck, Zap, X, Tag, Link2, Calendar, FileText, Sparkles, Folder, MessageCircle, Mic, Loader2, Volume2 } from 'lucide-react';
import { useStellarisStore } from '@/store';
import { NODE_VISUALS } from '@/types';
import { PhotoDetailPanel } from './PhotoDetailPanel';
import { useTranslation } from '@/i18n';

export const ContextPanel: React.FC = () => {
  const { t } = useTranslation();
  const { selectedNodeId, selectNode, getSelectedNode, getConnectedNodes, focusOnNode, toggleChat, openChatWithVoice, voiceState } = useStellarisStore();
  const selectedNode = getSelectedNode();
  const connectedNodes = selectedNodeId ? getConnectedNodes(selectedNodeId) : [];
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Dynamic Orb Color based on selected node type
  const nodeVisual = selectedNode ? NODE_VISUALS[selectedNode.type] : null;
  const primaryColor = nodeVisual ? nodeVisual.color : '#a88bff';
  const rawContent = (selectedNode?.metadata?.rawMarkdown as string) || selectedNode?.description || '';
  const isMemoryNode = Array.isArray((selectedNode?.metadata as any)?.photos);

  // Render raw markdown line-by-line with wikilink parsing [[Link]]
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('# ')) {
        return (
          <h2 key={idx} className="text-sm font-bold text-white tracking-wide border-b border-white/10 pb-1 my-1.5 font-sans">
            {line.replace('# ', '')}
          </h2>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h3 key={idx} className="text-xs font-bold text-purple-300 tracking-wide my-1 font-sans">
            {line.replace('## ', '')}
          </h3>
        );
      }
      if (!line.trim()) {
        return <div key={idx} className="h-1" />;
      }
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const itemText = line.trim().substring(2);
        return (
          <li key={idx} className="ml-3 text-slate-300 text-[11px] leading-relaxed font-mono list-disc my-0.5">
            {renderWikiLinks(itemText)}
          </li>
        );
      }
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

  // Render glowing animated 3D canvas orb
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const render = () => {
      time += 0.025;
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const radius = w * 0.32;

      ctx.clearRect(0, 0, w, h);

      // Outer glowing ring
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.3, 0, Math.PI * 2);
      ctx.strokeStyle = `${primaryColor}44`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Outer dashed ring (rotating)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(time * 0.5);
      ctx.beginPath();
      ctx.arc(0, 0, radius * 1.45, 0, Math.PI * 2);
      ctx.setLineDash([4, 8]);
      ctx.strokeStyle = `${primaryColor}88`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      // Core radial gradient fill
      const grad = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, radius * 0.1, cx, cy, radius);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.4, primaryColor);
      grad.addColorStop(1, '#090a16');

      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.shadowColor = primaryColor;
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Internal energy swirls
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-time * 0.8);
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.ellipse(0, 0, radius * 0.8, radius * 0.3, (i * Math.PI) / 3 + time * 0.3, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 + i * 0.1})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [primaryColor, selectedNodeId]);

  const orbTitle = selectedNode ? selectedNode.title : 'AURELIA ORB';
  const nodeType = selectedNode ? selectedNode.type.toUpperCase() : 'ACTIVE';

  return (
    <div 
      className={`fixed right-6 z-30 bg-[#0a0b18]/50 backdrop-blur-2xl border border-white/15 rounded-2xl p-4 shadow-[0_20px_60px_rgba(0,0,0,0.6)] font-mono transition-all duration-300 flex flex-col w-[300px] ${
        selectedNode
          ? 'top-[180px] bottom-14 border-white/25 shadow-[0_0_30px_rgba(168,139,255,0.2)]'
          : 'bottom-12'
      }`}
    >
      
      {/* Top Header with Close X Button */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2 shrink-0">
        <h3 className="text-[10px] tracking-[0.2em] font-bold text-slate-400 uppercase flex items-center gap-1.5 truncate">
          <FileText size={12} className="text-purple-400 shrink-0" />
          <span className="truncate">{selectedNode ? (isMemoryNode ? 'STELLORA MEMORY' : 'KNOWLEDGE NODE DETAILS') : 'CORE ORB'}</span>
        </h3>
        
        {selectedNode && (
          <button
            onClick={() => selectNode(null)}
            className="w-5 h-5 rounded-md bg-white/5 hover:bg-white/15 flex items-center justify-center text-slate-400 hover:text-white transition-colors shrink-0 ml-1"
            title="Close details (Esc)"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Large Centered Orb Hero Visual — skipped for photo nodes (they show the real photo instead) */}
      {!isMemoryNode && (
      <div
        className={`my-3 flex flex-col items-center gap-2.5 shrink-0 bg-white/5 py-5 px-3 rounded-xl border border-white/5 relative group ${!selectedNode ? 'cursor-pointer hover:border-purple-400/30' : ''}`}
        onClick={!selectedNode ? () => toggleChat() : undefined}
        title={!selectedNode ? t('openAiChat') : undefined}
      >
        {!selectedNode && (
          <span className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-300 text-[8px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
            <MessageCircle size={9} /> Chat
          </span>
        )}
        <canvas
          ref={canvasRef}
          width={220}
          height={220}
          className="w-[150px] h-[150px] cursor-pointer hover:scale-105 transition-transform duration-300 shrink-0"
        />

        <div className="min-w-0 flex flex-col items-center gap-1.5 text-center">
          <span className="text-sm font-bold text-slate-100 tracking-wider truncate max-w-full">
            {orbTitle}
          </span>
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            <span
              className="px-2 py-0.5 rounded-full text-[8px] font-bold border uppercase tracking-widest"
              style={{
                backgroundColor: `${primaryColor}22`,
                color: primaryColor,
                borderColor: `${primaryColor}44`
              }}
            >
              {nodeType}
            </span>
            {Boolean(selectedNode?.metadata?.folder) && (
              <span className="text-[9px] text-slate-400 uppercase flex items-center gap-0.5 truncate">
                <Folder size={9} className="text-purple-400 shrink-0" />
                <span className="truncate">{String(selectedNode?.metadata?.folder)}</span>
              </span>
            )}
          </div>
        </div>

        {/* One-click voice entry point — opens the chat panel and starts
            listening immediately, no typing needed (see openChatWithVoice). */}
        {!selectedNode && (
          <button
            onClick={(e) => { e.stopPropagation(); openChatWithVoice(); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all ${
              voiceState === 'listening'
                ? 'bg-red-500/20 border-red-400/60 text-red-300 animate-pulse'
                : voiceState === 'processing'
                ? 'bg-amber-500/20 border-amber-400/60 text-amber-300'
                : voiceState === 'speaking'
                ? 'bg-purple-500/20 border-purple-400/60 text-purple-300 animate-pulse'
                : 'bg-white/5 border-white/15 text-slate-300 hover:border-purple-400/40 hover:text-purple-200'
            }`}
          >
            {voiceState === 'processing' ? (
              <Loader2 size={11} className="animate-spin" />
            ) : voiceState === 'speaking' ? (
              <Volume2 size={11} />
            ) : (
              <Mic size={11} />
            )}
            {voiceState === 'listening'
              ? t('voiceListening')
              : voiceState === 'processing'
              ? t('voiceProcessing')
              : voiceState === 'speaking'
              ? t('voiceSpeaking')
              : t('talkButton')}
          </button>
        )}
      </div>
      )}

      {/* Photo nodes get their own Gallery/Memory view; everything else keeps the markdown reader */}
      {isMemoryNode && selectedNode ? (
        <div className="flex-1 flex flex-col min-h-0 border-t border-white/10 pt-2">
          <PhotoDetailPanel node={selectedNode} />
        </div>
      ) : selectedNode ? (
        <div className="flex-1 flex flex-col min-h-0 space-y-2 border-t border-white/10 pt-2 text-xs">

          {/* Scrollable Markdown Content */}
          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-1.5 bg-black/20 p-2.5 rounded-xl border border-white/5">
            {renderMarkdown(rawContent)}
          </div>

          {/* Tags & Connected Nodes Footer */}
          <div className="space-y-2 shrink-0 pt-1 border-t border-white/5">
            {/* Connected Nodes List */}
            {connectedNodes.length > 0 && (
              <div className="space-y-1">
                <span className="text-[9px] text-slate-400 tracking-wider font-semibold uppercase flex items-center gap-1">
                  <Link2 size={10} className="text-cyan-400" />
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
                      className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-400/40 text-[10px] text-slate-300 hover:text-white flex items-center gap-1 transition-all group"
                    >
                      <span className="w-1 h-1 rounded-full bg-purple-400 group-hover:scale-125 transition-transform" />
                      <span className="truncate max-w-[110px]">{connNode.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Importance & Tags Row */}
            <div className="flex items-center justify-between text-[9px] text-slate-400 pt-0.5">
              <div className="flex items-center gap-1">
                <Zap size={10} className="text-amber-400" />
                <span>IMPORTANCE: {selectedNode.importance}/5</span>
              </div>
              {selectedNode.tags && selectedNode.tags.length > 0 && (
                <div className="flex items-center gap-1 truncate max-w-[110px]">
                  <Tag size={10} className="text-slate-500" />
                  <span className="truncate">#{selectedNode.tags[0]}</span>
                </div>
              )}
            </div>
          </div>

        </div>
      ) : (
        /* Standard Core Metrics when no node is selected */
        <div className="space-y-2 border-t border-white/10 pt-3 text-xs shrink-0">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] tracking-wider flex items-center gap-1.5">
              <Zap size={11} className="text-amber-400" />
              <span>Energy Signature</span>
            </span>
            <span className="text-slate-100 font-semibold">7.23 X</span>
          </div>

          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] tracking-wider flex items-center gap-1.5">
              <ShieldCheck size={11} className="text-emerald-400" />
              <span>Stability Index</span>
            </span>
            <span className="text-slate-100 font-semibold">98.6%</span>
          </div>

          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] tracking-wider flex items-center gap-1.5">
              <Activity size={11} className="text-cyan-400" />
              <span>Life Potential</span>
            </span>
            <span className="text-cyan-400 font-semibold">High</span>
          </div>
        </div>
      )}

      {/* Footer Link */}
      <div 
        onClick={() => {
          if (selectedNode) selectNode(null);
        }}
        className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400 font-semibold group cursor-pointer hover:text-white transition-colors shrink-0"
      >
        <span>{selectedNode ? 'DESELECT NODE' : 'VIEW ORB DETAILS'}</span>
        <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
};
