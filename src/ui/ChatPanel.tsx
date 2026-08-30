import React, { useEffect, useRef, useState } from 'react';
import { X, Send, Mic, MicOff, Volume2, VolumeX, Bot, Loader2 } from 'lucide-react';
import { useStellarisStore } from '@/store';
import { useAiConfig, AI_PROVIDER_LABELS } from '@/hooks/useAiConfig';
import { runChat, type ChatTool, type ChatTurn } from '@/services/aiChat';
import { reverseGeocode } from '@/utils/reverseGeocode';
import { useTranslation } from '@/i18n';
import type { StellorMemoryMetadata } from '@/types';
import { readStellorPhotoNote } from '@/hooks/useStellorPhotoNote';
import { readStellorMemory } from '@/hooks/useStellorMemory';

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function systemPrompt(): string {
  return (
    'You are an assistant embedded in the Stellora galaxy app. You help the user explore their ' +
    "knowledge notes and Stellora memories (one node per calendar day of photos), and can connect nodes together. " +
    `Today's date is ${todayIso()} — resolve relative time references ("last Christmas", "last summer", "3 months ago") ` +
    'into concrete dates or date ranges yourself before calling a tool.\n\n' +
    'Available tools: list_nodes (browse everything), gallery_search (find memory days by date, date range, ' +
    'place name, or how many people are in the photos), open_memory (actually select and focus a memory in the ' +
    '3D view — call this after gallery_search finds what the user asked for, don\'t just describe it in text), ' +
    'and connect_nodes (link two nodes).\n\n' +
    'When the user asks to see/find a memory, call gallery_search, then call open_memory with the best match\'s ' +
    'nodeId so it actually opens in the app — that is the whole point of asking. If gallery_search returns ' +
    'several plausible matches, briefly ask which one before opening. Keep replies short and conversational.'
  );
}

const CHAT_TOOLS: ChatTool[] = [
  {
    name: 'list_nodes',
    description: "Lists every node in the galaxy (id, title, type, tags).",
    parameters: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'gallery_search',
    description:
      "Searches Stellora memory days (one node per calendar day of photos) by date, date range, place name, " +
      "how many people appear in the photos, and/or free-text over the scene/story. Returns candidate nodeIds — " +
      "call open_memory on the best match afterward, don't just report results as text.",
    parameters: {
      type: 'object',
      properties: {
        date: { type: 'string', description: 'Exact day, "YYYY-MM-DD", or any-year match "MM-DD" (e.g. "12-25" for every Dec 25th)' },
        dateFrom: { type: 'string', description: 'Start of a date range, "YYYY-MM-DD" (inclusive)' },
        dateTo: { type: 'string', description: 'End of a date range, "YYYY-MM-DD" (inclusive)' },
        month: { type: 'number', description: 'Match any day in this calendar month, 1-12 (e.g. 12 for "in December") — use this instead of guessing at "date" when you only know the month' },
        location: { type: 'string', description: 'Free-text place name substring to match against the reverse-geocoded location, e.g. "Antalya" or "Portland"' },
        peopleCount: { type: 'number', description: 'Match days where a photo shows exactly this many people' },
        query: { type: 'string', description: 'Free-text match against the scene description, tags, or story' },
      },
      required: [],
    },
  },
  {
    name: 'open_memory',
    description: 'Selects and focuses a memory (or any node) in the 3D view by its nodeId — this is the action that actually shows it to the user.',
    parameters: {
      type: 'object',
      properties: { nodeId: { type: 'string', description: 'The nodeId to open, from list_nodes or gallery_search' } },
      required: ['nodeId'],
    },
  },
  {
    name: 'connect_nodes',
    description: 'Creates a connection between two nodes; appears as a line in the galaxy graph.',
    parameters: {
      type: 'object',
      properties: {
        fromId: { type: 'string', description: 'Source node id' },
        toId: { type: 'string', description: 'Target node id' },
        strength: { type: 'number', description: 'Connection strength 0-1, default 0.6' },
      },
      required: ['fromId', 'toId'],
    },
  },
];

function dayKeyOf(node: { metadata?: Record<string, unknown> }): string | null {
  const meta = node.metadata as unknown as StellorMemoryMetadata | undefined;
  return meta?.dayKey ?? null;
}

async function executeTool(name: string, args: Record<string, unknown>): Promise<string> {
  const store = useStellarisStore.getState();

  if (name === 'list_nodes') {
    const all = [...store.nodes, ...store.searchIndex];
    return JSON.stringify(all.slice(0, 200).map((n) => ({ id: n.id, title: n.title, type: n.type, tags: n.tags })));
  }

  if (name === 'gallery_search') {
    const { date, dateFrom, dateTo, month, location, peopleCount, query } = args as Record<string, unknown>;
    const memoryNodes = store.nodes.filter((n) => Array.isArray((n.metadata as any)?.photos));

    // The model doesn't always send a clean "YYYY-MM-DD" or "MM-DD" — it has sent
    // things like "12-" when it only knows the month. Normalize defensively rather
    // than silently filtering out every candidate on a malformed value.
    const cleanDate = typeof date === 'string' ? date.trim().replace(/-+$/, '') : '';

    let candidates = memoryNodes.filter((n) => {
      const dayKey = dayKeyOf(n);
      if (!dayKey) return false;
      if (cleanDate) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)) {
          if (dayKey !== cleanDate) return false;
        } else if (/^\d{2}-\d{2}$/.test(cleanDate)) {
          if (dayKey.slice(5) !== cleanDate) return false;
        } else if (/^\d{1,2}$/.test(cleanDate)) {
          if (dayKey.slice(5, 7) !== cleanDate.padStart(2, '0')) return false;
        }
        // else: unrecognized format — ignore rather than exclude everything.
      }
      if (typeof month === 'number' && dayKey.slice(5, 7) !== String(month).padStart(2, '0')) return false;
      if (typeof dateFrom === 'string' && dateFrom && dayKey < dateFrom) return false;
      if (typeof dateTo === 'string' && dateTo && dayKey > dateTo) return false;
      return true;
    });

    if (typeof peopleCount === 'number') {
      candidates = candidates.filter((n) => {
        const meta = n.metadata as unknown as StellorMemoryMetadata;
        return meta.photos.some((p) => {
          const override = readStellorPhotoNote(p.filename)?.peopleObserved;
          return (override ?? p.peopleObserved) === peopleCount;
        });
      });
    }

    if (typeof query === 'string' && query.trim()) {
      // Word-level match, not exact-phrase — "car dealership" should still find
      // a scene that only says "car", not require the literal phrase. Owner-written
      // edits (scene/tags per photo, story per day) live in localStorage and take
      // priority over the loader's static seed text, so merge those in too —
      // otherwise search never sees what the user actually wrote.
      const words = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
      candidates = candidates
        .map((n) => {
          const meta = n.metadata as unknown as StellorMemoryMetadata;
          const story = readStellorMemory(n.id).story;
          const photoText = meta.photos.flatMap((p) => {
            const override = readStellorPhotoNote(p.filename);
            const scene = override?.scene ?? p.scene;
            const tags = override?.tags ?? p.tags ?? [];
            return [scene, ...tags];
          });
          const haystack = [meta.daySummary, story, ...photoText].join(' ').toLowerCase();
          const score = words.filter((w) => haystack.includes(w)).length;
          return { n, score };
        })
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((r) => r.n);
    }

    if (typeof location === 'string' && location.trim()) {
      const loc = location.toLowerCase();
      const withPlace: typeof candidates = [];
      for (const n of candidates) {
        const meta = n.metadata as unknown as StellorMemoryMetadata;
        const gps = meta.photos.find((p) => p.gps)?.gps;
        if (!gps) continue;
        const place = await reverseGeocode(gps.lat, gps.lon, 'en');
        if (place && place.toLowerCase().includes(loc)) withPlace.push(n);
      }
      candidates = withPlace;
    }

    if (candidates.length === 0) return 'No matching memories found.';
    const results = candidates.slice(0, 10).map((n) => {
      const meta = n.metadata as unknown as StellorMemoryMetadata;
      // Report the owner's actual override, not the loader's static (usually 0) seed —
      // otherwise the model sees a "peopleObserved: 0" field that contradicts the
      // peopleCount it just filtered on and second-guesses a perfectly good match.
      const peopleObserved = Math.max(
        meta.peopleObserved,
        ...meta.photos.map((p) => readStellorPhotoNote(p.filename)?.peopleObserved ?? 0)
      );
      return { nodeId: n.id, dateLabel: meta.dateLabel, dayKey: meta.dayKey, peopleObserved, photoCount: meta.photos.length, summary: meta.daySummary };
    });
    return JSON.stringify(results);
  }

  if (name === 'open_memory') {
    const nodeId = String(args.nodeId ?? '');
    const node = store.getNodeById(nodeId);
    if (!node) return `Node not found: ${nodeId}`;
    store.selectNode(nodeId);
    store.focusOnNode(nodeId);
    return `Opened "${node.title}" in the 3D view.`;
  }

  if (name === 'connect_nodes') {
    const fromId = String(args.fromId ?? '');
    const toId = String(args.toId ?? '');
    const strength = typeof args.strength === 'number' ? args.strength : 0.6;
    return store.addConnection(fromId, toId, strength).message;
  }
  return `Unknown tool: ${name}`;
}

type SpeechRecognitionCtor = new () => any;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  const w = window as any;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export const ChatPanel: React.FC = () => {
  const { setChatOpen, setActiveDockTab } = useStellarisStore();
  const { activeProvider, activeSettings, isConfigured } = useAiConfig();
  const { lang } = useTranslation();
  const speechLang = lang === 'tr' ? 'tr-TR' : 'en-US';

  const [messages, setMessages] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const speechSupported = typeof window !== 'undefined' && getSpeechRecognitionCtor() !== null;
  const ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isLoading]);

  // Stop any in-progress speech recognition when the panel unmounts
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const toggleListening = () => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return;
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }
    const recognition = new Ctor();
    recognition.lang = speechLang;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript ?? '';
      setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  };

  const speak = (text: string) => {
    if (!ttsEnabled || !ttsSupported || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = speechLang;
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setError(null);
    setInput('');
    const nextHistory: ChatTurn[] = [...messages, { role: 'user', content: text }];
    setMessages(nextHistory);
    setIsLoading(true);
    try {
      const reply = await runChat(activeProvider, activeSettings, systemPrompt(), nextHistory, CHAT_TOOLS, executeTool);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply || '(boş cevap)' }]);
      speak(reply);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-[420px] max-w-[92vw] max-h-[75vh] flex flex-col bg-[#0a0b18]/95 border border-white/15 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] font-mono">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Bot size={16} className="text-purple-400 shrink-0" />
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-white tracking-wider uppercase">AI CHAT</div>
              <div className="text-[9px] text-slate-500 truncate">{AI_PROVIDER_LABELS[activeProvider]}</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {ttsSupported && (
              <button
                onClick={() => setTtsEnabled((v) => !v)}
                title={ttsEnabled ? 'Turn off voice replies' : 'Turn on voice replies'}
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                {ttsEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
              </button>
            )}
            <button
              onClick={() => setChatOpen(false)}
              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {!isConfigured ? (
          <div className="p-5 flex flex-col items-center gap-3 text-center">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Pick an AI provider and enter your own API key first — from the SETTINGS tab.
              Your key stays in this browser and is never sent anywhere else.
            </p>
            <button
              onClick={() => {
                setActiveDockTab('settings');
                setChatOpen(false);
              }}
              className="px-3 py-1.5 rounded-lg bg-purple-500/20 border border-purple-400/50 text-purple-200 text-[10px] font-bold uppercase tracking-wider hover:bg-purple-500/30"
            >
              GO TO SETTINGS
            </button>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar px-4 py-3 space-y-2.5 min-h-[200px]">
              {messages.length === 0 && (
                <p className="text-[11px] text-slate-500 text-center pt-6">
                  Ask about your nodes, or try "show me the photo from December 25th."
                </p>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-[11px] leading-relaxed whitespace-pre-wrap ${
                      m.role === 'user'
                        ? 'bg-purple-500/20 border border-purple-400/30 text-purple-100'
                        : 'bg-white/5 border border-white/10 text-slate-200'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-xl px-3 py-2 bg-white/5 border border-white/10 text-slate-400 flex items-center gap-1.5">
                    <Loader2 size={12} className="animate-spin" />
                    <span className="text-[10px]">thinking…</span>
                  </div>
                </div>
              )}
              {error && (
                <div className="rounded-xl px-3 py-2 bg-red-500/10 border border-red-400/30 text-red-300 text-[10px]">{error}</div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/10 flex items-center gap-1.5 shrink-0">
              {speechSupported && (
                <button
                  onClick={toggleListening}
                  title={isListening ? 'Stop listening' : 'Speak'}
                  className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center transition-colors ${
                    isListening ? 'bg-red-500/20 border border-red-400/50 text-red-300' : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {isListening ? <MicOff size={13} /> : <Mic size={13} />}
                </button>
              )}
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSend();
                }}
                placeholder="Ask something…"
                className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-[11px] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-purple-400/50"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="w-8 h-8 shrink-0 rounded-lg bg-purple-500/20 border border-purple-400/50 text-purple-200 flex items-center justify-center hover:bg-purple-500/30 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send size={13} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
