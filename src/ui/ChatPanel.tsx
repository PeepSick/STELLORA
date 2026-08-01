import React, { useEffect, useRef, useState } from 'react';
import { X, Send, Mic, MicOff, Volume2, VolumeX, Bot, Loader2 } from 'lucide-react';
import { useStellarisStore } from '@/store';
import { useAiConfig, AI_PROVIDER_LABELS } from '@/hooks/useAiConfig';
import { runChat, type ChatTool, type ChatTurn } from '@/services/aiChat';

const SYSTEM_PROMPT =
  'Sen Stellora galaksi uygulamasının içinde çalışan bir asistansın. Kullanıcının bilgi ve anı ' +
  "node'larını incelemesine ve aralarında bağlantı kurmasına yardımcı oluyorsun. list_nodes aracıyla " +
  "mevcut node'ları görebilir, connect_nodes aracıyla iki node arasında bağlantı kurabilirsin. " +
  'Kısa, net ve Türkçe cevap ver.';

const CHAT_TOOLS: ChatTool[] = [
  {
    name: 'list_nodes',
    description: "Galaksideki tüm node'ları (id, başlık, tip, etiketler) listeler.",
    parameters: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'connect_nodes',
    description: "İki node arasında bağlantı kurar; galaksi grafiğinde çizgi olarak görünür.",
    parameters: {
      type: 'object',
      properties: {
        fromId: { type: 'string', description: 'Kaynak node id' },
        toId: { type: 'string', description: 'Hedef node id' },
        strength: { type: 'number', description: '0-1 arası bağlantı gücü, varsayılan 0.6' },
      },
      required: ['fromId', 'toId'],
    },
  },
];

async function executeTool(name: string, args: Record<string, unknown>): Promise<string> {
  const store = useStellarisStore.getState();
  if (name === 'list_nodes') {
    const all = [...store.nodes, ...store.searchIndex];
    return JSON.stringify(all.slice(0, 200).map((n) => ({ id: n.id, title: n.title, type: n.type, tags: n.tags })));
  }
  if (name === 'connect_nodes') {
    const fromId = String(args.fromId ?? '');
    const toId = String(args.toId ?? '');
    const strength = typeof args.strength === 'number' ? args.strength : 0.6;
    return store.addConnection(fromId, toId, strength).message;
  }
  return `Bilinmeyen araç: ${name}`;
}

type SpeechRecognitionCtor = new () => any;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  const w = window as any;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export const ChatPanel: React.FC = () => {
  const { setChatOpen, setActiveDockTab } = useStellarisStore();
  const { activeProvider, activeSettings, isConfigured } = useAiConfig();

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
    recognition.lang = 'tr-TR';
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
    utterance.lang = 'tr-TR';
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
      const reply = await runChat(activeProvider, activeSettings, SYSTEM_PROMPT, nextHistory, CHAT_TOOLS, executeTool);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply || '(boş cevap)' }]);
      speak(reply);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Bilinmeyen hata');
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
                title={ttsEnabled ? 'Sesli cevabı kapat' : 'Sesli cevabı aç'}
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
              Önce bir AI sağlayıcı seç ve kendi API key'ini gir — SETTINGS sekmesinden.
              Key sadece bu tarayıcıda saklanır, hiçbir sunucuya gönderilmez.
            </p>
            <button
              onClick={() => {
                setActiveDockTab('settings');
                setChatOpen(false);
              }}
              className="px-3 py-1.5 rounded-lg bg-purple-500/20 border border-purple-400/50 text-purple-200 text-[10px] font-bold uppercase tracking-wider hover:bg-purple-500/30"
            >
              SETTINGS'E GİT
            </button>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar px-4 py-3 space-y-2.5 min-h-[200px]">
              {messages.length === 0 && (
                <p className="text-[11px] text-slate-500 text-center pt-6">
                  Node'lar hakkında soru sor ya da "X ile Y'yi bağla" gibi bir istek yaz.
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
                    <span className="text-[10px]">düşünüyor…</span>
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
                  title={isListening ? 'Dinlemeyi durdur' : 'Sesli konuş'}
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
                placeholder="Bir şey sor…"
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
