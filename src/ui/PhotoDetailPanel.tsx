import React, { useEffect, useState } from 'react';
import {
  Image as ImageIcon, BookOpen, Calendar, Camera, MapPin, Users,
  ChevronLeft, ChevronRight, ImagesIcon, ChevronDown, ChevronUp,
  Aperture, Gauge, Ruler, Star, Heart, Clock, Sparkles,
} from 'lucide-react';
import { useStellarisStore } from '@/store';
import { useStellorMemory } from '@/hooks/useStellorMemory';
import { useStellorPhotoNote } from '@/hooks/useStellorPhotoNote';
import { useReverseGeocode } from '@/hooks/useReverseGeocode';
import type { StellarisNode, StellorMemoryMetadata } from '@/types';

interface MemoryDetailPanelProps {
  node: StellarisNode;
}

// Minimal markdown + [[wikilink]] renderer for the story field — headers, lists, paragraphs
function renderStoryMarkdown(text: string, onLinkClick: (title: string) => void): React.ReactNode[] {
  if (!text.trim()) return [];
  const renderLinks = (line: string) => {
    const parts = line.split(/(\[\[.*?\]\])/g);
    return parts.map((part, i) => {
      if (part.startsWith('[[') && part.endsWith(']]')) {
        const title = part.slice(2, -2);
        return (
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); onLinkClick(title); }}
            className="inline-flex items-center gap-0.5 px-1 py-0.5 mx-0.5 rounded bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 hover:text-white border border-purple-500/40 font-semibold cursor-pointer transition-all text-[10px]"
          >
            <Sparkles size={9} className="text-amber-300" />
            {title}
          </button>
        );
      }
      return part;
    });
  };

  return text.split('\n').map((line, idx) => {
    if (line.startsWith('# ')) {
      return <h2 key={idx} className="text-sm font-bold text-white my-1">{line.slice(2)}</h2>;
    }
    if (line.startsWith('## ')) {
      return <h3 key={idx} className="text-xs font-bold text-purple-300 my-1">{line.slice(3)}</h3>;
    }
    if (!line.trim()) return <div key={idx} className="h-1" />;
    if (line.trim().startsWith('- ')) {
      return <li key={idx} className="ml-3 text-slate-300 text-[11px] leading-relaxed list-disc my-0.5">{renderLinks(line.trim().slice(2))}</li>;
    }
    return <p key={idx} className="text-slate-300 text-[11px] leading-relaxed my-1">{renderLinks(line)}</p>;
  });
}

const MARK_CONFIG = {
  favorite: { icon: Star, label: 'Favorite', color: '#FDE68A' },
  important: { icon: Heart, label: 'Important', color: '#F472B6' },
  archived: { icon: Clock, label: 'Archived', color: '#94A3B8' },
} as const;

export const PhotoDetailPanel: React.FC<MemoryDetailPanelProps> = ({ node }) => {
  const [view, setView] = useState<'gallery' | 'memory'>('gallery');
  const [storyEditing, setStoryEditing] = useState(false);
  const [sceneEditing, setSceneEditing] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const photoIndex = useStellarisStore((s) => s.activePhotoIndex);
  const setPhotoIndex = useStellarisStore((s) => s.setActivePhotoIndex);
  const { nodes, searchIndex, selectNode, focusOnNode } = useStellarisStore();
  const { memory, updateStory, updatePeople, setMark } = useStellorMemory(node.id);
  const meta = node.metadata as unknown as StellorMemoryMetadata;
  const photos = meta.photos;
  const current = photos[Math.min(photoIndex, photos.length - 1)];
  // Scene/tags are written by whoever lived the memory, not an AI vision pipeline (Faz 2 decision)
  const { note: currentNote, updateScene, updateTags } = useStellorPhotoNote(current.filename, {
    scene: current.scene,
    tags: current.tags,
  });
  const firstGps = photos.find((p) => p.gps)?.gps ?? null;
  const summaryPlace = useReverseGeocode(firstGps);
  const currentPlace = useReverseGeocode(current.gps);

  const photoDateLabel = current?.dateTaken
    ? new Date(current.dateTaken).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    : null;

  // Editing a photo's own scene text shouldn't carry over when the slider moves to a different photo
  useEffect(() => setSceneEditing(false), [current.filename]);

  const goto = (i: number) => {
    setPhotoIndex(((i % photos.length) + photos.length) % photos.length);
    setView('gallery');
  };

  const handleWikilinkClick = (title: string) => {
    const allNodes = [...nodes, ...searchIndex];
    const match = allNodes.find((n) => n.title.toLowerCase() === title.toLowerCase());
    if (match) {
      selectNode(match.id);
      focusOnNode(match.id);
    }
  };

  return (
    <>
      {/* Compact summary card — always visible */}
      <div className="bg-black/20 rounded-xl border border-white/5 p-2.5 mb-3 space-y-1.5 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-slate-300 min-w-0">
            <Calendar size={11} className="text-amber-400 shrink-0" />
            <span className="text-[11px] font-semibold truncate">{meta.dateLabel}</span>
          </div>
          {/* Manual importance marking: Favorite / Important / Archived */}
          <div className="flex items-center gap-1 shrink-0">
            {(Object.keys(MARK_CONFIG) as Array<keyof typeof MARK_CONFIG>).map((key) => {
              const cfg = MARK_CONFIG[key];
              const Icon = cfg.icon;
              const active = memory.mark === key;
              return (
                <button
                  key={key}
                  onClick={() => setMark(key)}
                  title={cfg.label}
                  className="w-5 h-5 rounded-md flex items-center justify-center transition-all"
                  style={{
                    color: active ? cfg.color : '#475569',
                    backgroundColor: active ? `${cfg.color}22` : 'transparent',
                  }}
                >
                  <Icon size={12} fill={active ? cfg.color : 'none'} />
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap text-[10px] text-slate-400">
          <span className="flex items-center gap-1"><ImagesIcon size={10} className="text-amber-400" /> {photos.length} foto</span>
          {meta.peopleObserved > 0 && (
            <span className="flex items-center gap-1"><Users size={10} className="text-cyan-400" /> {meta.peopleObserved} kişi</span>
          )}
          {firstGps ? (
            <span className="flex items-center gap-1" title={`${firstGps.lat.toFixed(5)}, ${firstGps.lon.toFixed(5)}`}>
              <MapPin size={10} className="text-emerald-400" />
              {summaryPlace ?? <span className="font-mono">{firstGps.lat.toFixed(3)}, {firstGps.lon.toFixed(3)}</span>}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-slate-500"><MapPin size={10} /> konum yok</span>
          )}
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed pt-0.5">{meta.daySummary}</p>
      </div>

      {/* View toggle: Media vs Memory */}
      <div className="grid grid-cols-2 gap-2 mb-3 shrink-0">
        <button
          onClick={() => setView('gallery')}
          className={`h-8 rounded-lg flex items-center justify-center gap-1.5 text-[10px] font-bold tracking-wider border transition-all ${
            view === 'gallery'
              ? 'bg-amber-500/20 border-amber-400/60 text-amber-200'
              : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
          }`}
        >
          <ImageIcon size={12} />
          MEDIA
        </button>
        <button
          onClick={() => setView('memory')}
          className={`h-8 rounded-lg flex items-center justify-center gap-1.5 text-[10px] font-bold tracking-wider border transition-all ${
            view === 'memory'
              ? 'bg-purple-500/20 border-purple-400/60 text-purple-200'
              : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen size={12} />
          MEMORY
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 text-xs pr-1">
        {view === 'gallery' ? (
          <>
            <div className="relative">
              <img
                src={current.imageUrl}
                alt={node.title}
                className="w-full rounded-xl border border-white/10 shadow-lg object-cover max-h-64"
              />
              {photos.length > 1 && (
                <>
                  <button
                    onClick={() => goto(photoIndex - 1)}
                    className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/70 border border-white/20 flex items-center justify-center text-white hover:bg-black/90"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => goto(photoIndex + 1)}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/70 border border-white/20 flex items-center justify-center text-white hover:bg-black/90"
                  >
                    <ChevronRight size={14} />
                  </button>
                  <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-black/70 text-[9px] text-white font-mono">
                    {photoIndex + 1}/{photos.length}
                  </span>
                </>
              )}
            </div>
            {/* Scene + tags — written by whoever lived the memory, not an AI vision pipeline (Faz 2) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-slate-400 tracking-wider font-semibold uppercase">Sahne</span>
                <button
                  onClick={() => setSceneEditing((v) => !v)}
                  className="text-[9px] text-amber-300 hover:text-amber-100 font-semibold uppercase"
                >
                  {sceneEditing ? 'Bitti' : 'Düzenle'}
                </button>
              </div>
              {sceneEditing ? (
                <div className="space-y-1">
                  <textarea
                    value={currentNote.scene}
                    onChange={(e) => updateScene(e.target.value)}
                    placeholder="Bu fotoğrafta ne oluyordu?"
                    rows={2}
                    autoFocus
                    className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-[11px] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-400/50 resize-none"
                  />
                  <input
                    type="text"
                    defaultValue={currentNote.tags.join(', ')}
                    onBlur={(e) => updateTags(e.target.value)}
                    placeholder="etiketler, virgülle ayır…"
                    className="w-full bg-black/30 border border-white/10 rounded-lg p-1.5 text-[10px] text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-amber-400/50 font-mono"
                  />
                </div>
              ) : currentNote.scene.trim() ? (
                <p
                  onClick={() => setSceneEditing(true)}
                  className="text-[11px] text-slate-300 leading-relaxed cursor-text"
                >
                  {currentNote.scene}
                </p>
              ) : (
                <button
                  onClick={() => setSceneEditing(true)}
                  className="w-full bg-black/30 border border-dashed border-white/10 rounded-lg p-2 text-[11px] text-slate-600 text-left hover:border-amber-400/40 hover:text-slate-400"
                >
                  Bu fotoğrafta ne oluyordu, yaz…
                </button>
              )}
              {!sceneEditing && currentNote.tags.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  {currentNote.tags.map((tag) => (
                    <span key={tag} className="px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] text-slate-400 font-mono">{tag}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="bg-black/20 rounded-xl border border-white/5 p-2.5 space-y-1.5">
              {photoDateLabel && (
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Calendar size={11} className="text-amber-400 shrink-0" />
                  <span className="text-[11px]">{photoDateLabel}</span>
                </div>
              )}
              {current.camera && (
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Camera size={11} className="text-cyan-400 shrink-0" />
                  <span className="text-[11px]">{current.camera}</span>
                </div>
              )}
              {current.gps ? (
                <div className="flex items-center gap-1.5 text-slate-300" title={`${current.gps.lat.toFixed(5)}, ${current.gps.lon.toFixed(5)}`}>
                  <MapPin size={11} className="text-emerald-400 shrink-0" />
                  <span className="text-[11px]">
                    {currentPlace ?? <span className="font-mono">{current.gps.lat.toFixed(5)}, {current.gps.lon.toFixed(5)}</span>}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-slate-500">
                  <MapPin size={11} className="shrink-0" />
                  <span className="text-[11px]">Konum verisi yok (EXIF'te GPS bulunamadı)</span>
                </div>
              )}

              {/* Details accordion — lens/ISO/aperture/resolution, only if EXIF actually has them */}
              {(current.lens || current.iso || current.fNumber || current.focalLength || current.resolution) && (
                <div className="pt-1 border-t border-white/5">
                  <button
                    onClick={() => setDetailsOpen((v) => !v)}
                    className="w-full flex items-center justify-between text-[10px] text-slate-400 hover:text-slate-200 font-semibold uppercase tracking-wider"
                  >
                    <span>Details</span>
                    {detailsOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                  {detailsOpen && (
                    <div className="mt-1.5 space-y-1">
                      {current.lens && (
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Aperture size={10} className="shrink-0" />
                          <span className="text-[10px]">{current.lens}</span>
                        </div>
                      )}
                      {(current.fNumber || current.focalLength || current.iso) && (
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Gauge size={10} className="shrink-0" />
                          <span className="text-[10px] font-mono">
                            {current.fNumber ? `f/${current.fNumber}` : ''}
                            {current.focalLength ? ` · ${current.focalLength}mm` : ''}
                            {current.iso ? ` · ISO${current.iso}` : ''}
                          </span>
                        </div>
                      )}
                      {current.resolution && (
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Ruler size={10} className="shrink-0" />
                          <span className="text-[10px] font-mono">{current.resolution.width}×{current.resolution.height}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-slate-400 tracking-wider font-semibold uppercase flex items-center gap-1">
                  <BookOpen size={10} className="text-purple-400" />
                  HİKAYE
                </span>
                <button
                  onClick={() => setStoryEditing((v) => !v)}
                  className="text-[9px] text-purple-300 hover:text-purple-100 font-semibold uppercase"
                >
                  {storyEditing ? 'Önizleme' : 'Düzenle'}
                </button>
              </div>
              {storyEditing ? (
                <textarea
                  value={memory.story}
                  onChange={(e) => updateStory(e.target.value)}
                  placeholder="Bu günün hikayesini yaz… (markdown + [[wikilink]] destekli)"
                  rows={5}
                  autoFocus
                  className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-[11px] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-purple-400/50 resize-none font-mono"
                />
              ) : memory.story.trim() ? (
                <div
                  onClick={() => setStoryEditing(true)}
                  className="bg-black/30 border border-white/10 rounded-lg p-2 cursor-text min-h-[60px]"
                >
                  {renderStoryMarkdown(memory.story, handleWikilinkClick)}
                </div>
              ) : (
                <button
                  onClick={() => setStoryEditing(true)}
                  className="w-full bg-black/30 border border-dashed border-white/10 rounded-lg p-2 text-[11px] text-slate-600 text-left hover:border-purple-400/40 hover:text-slate-400"
                >
                  Bu günün hikayesini yaz…
                </button>
              )}
            </div>

            <div className="space-y-1">
              <span className="text-[9px] text-slate-400 tracking-wider font-semibold uppercase flex items-center gap-1">
                <Users size={10} className="text-cyan-400" />
                KİŞİLER
              </span>
              <input
                type="text"
                defaultValue={memory.people.join(', ')}
                onBlur={(e) => updatePeople(e.target.value)}
                placeholder="virgülle ayırarak isim ekle…"
                className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-[11px] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400/50"
              />
            </div>

            {photos.length > 1 && (
              <div className="space-y-1">
                <span className="text-[9px] text-slate-400 tracking-wider font-semibold uppercase flex items-center gap-1">
                  <ImagesIcon size={10} className="text-amber-400" />
                  BU GÜNÜN FOTOĞRAFLARI ({photos.length})
                </span>
                <div className="flex gap-1.5 overflow-x-auto custom-scrollbar pb-1">
                  {photos.map((p, i) => (
                    <button
                      key={p.imageUrl}
                      onClick={() => goto(i)}
                      className="shrink-0 w-12 h-12 rounded-lg overflow-hidden border border-white/10 hover:border-amber-400/60 transition-all"
                    >
                      <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};
