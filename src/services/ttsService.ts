/**
 * Text-to-speech with graceful provider degradation:
 *
 *   Gemini configured (real API key) → Gemini's own native TTS model,
 *   genuinely natural multilingual voice, one extra API call.
 *
 *   No API key / any other provider / the Gemini call fails for any reason
 *   → the browser's built-in SpeechSynthesis, picking a voice that actually
 *   matches the reply's language rather than a static UI setting.
 *
 * Voice quality differs between the two paths — that's expected and fine.
 * What must never happen is Talk/TTS simply not working because the user
 * has no key: everyone gets a spoken reply, just from a different source.
 */

const GEMINI_TTS_MODEL = 'gemini-2.5-flash-preview-tts';

/** Turkish has several letters with no English equivalent — a simple,
 *  reliable enough language detector for picking a matching voice. */
export function detectSpeechLocale(text: string): 'tr-TR' | 'en-US' {
  return /[çğıöşüÇĞİÖŞÜ]/.test(text) ? 'tr-TR' : 'en-US';
}

/** Wrap raw 16-bit PCM into a playable WAV Blob (browsers can't play bare PCM). */
function pcmToWavBlob(pcmBytes: Uint8Array, sampleRate: number): Blob {
  const numChannels = 1;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const header = new ArrayBuffer(44);
  const view = new DataView(header);
  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };
  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + pcmBytes.length, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // bits per sample
  writeStr(36, 'data');
  view.setUint32(40, pcmBytes.length, true);
  // Slice to a plain ArrayBuffer — Blob's typings want ArrayBufferView<ArrayBuffer>,
  // and Uint8Array's backing buffer is typed as the broader ArrayBufferLike.
  const pcmCopy = pcmBytes.slice();
  return new Blob([header, pcmCopy], { type: 'audio/wav' });
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/**
 * Calls Gemini's native TTS model and returns a playable object URL, or null
 * if anything about the call didn't work out — callers should treat null as
 * "fall back to browser TTS", not as an error to surface to the user.
 */
export async function synthesizeGeminiSpeech(text: string, apiKey: string): Promise<string | null> {
  if (!apiKey || !text.trim()) return null;
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_TTS_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
        },
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const part = data.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
    const inline = part?.inlineData;
    if (!inline?.data) return null;

    // Gemini TTS returns raw PCM (mimeType like "audio/L16;codec=pcm;rate=24000") —
    // parse the sample rate out of it, default to the documented 24kHz.
    const rateMatch = /rate=(\d+)/.exec(inline.mimeType ?? '');
    const sampleRate = rateMatch ? parseInt(rateMatch[1], 10) : 24000;
    const wavBlob = pcmToWavBlob(base64ToBytes(inline.data), sampleRate);
    return URL.createObjectURL(wavBlob);
  } catch {
    return null;
  }
}

let cachedVoices: SpeechSynthesisVoice[] = [];
function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const existing = window.speechSynthesis.getVoices();
    if (existing.length > 0) {
      cachedVoices = existing;
      resolve(existing);
      return;
    }
    // Some browsers populate the voice list asynchronously on first call.
    const handler = () => {
      cachedVoices = window.speechSynthesis.getVoices();
      window.speechSynthesis.removeEventListener('voiceschanged', handler);
      resolve(cachedVoices);
    };
    window.speechSynthesis.addEventListener('voiceschanged', handler);
    // Fallback in case the event never fires (some browsers just don't emit it).
    setTimeout(() => resolve(window.speechSynthesis.getVoices()), 300);
  });
}

/**
 * Speaks text via the browser's built-in SpeechSynthesis, picking a voice
 * that actually matches the target locale instead of relying solely on
 * utterance.lang (which some browsers ignore if no matching voice exists,
 * silently falling back to whatever the system default happens to be).
 */
export async function speakWithBrowserTts(
  text: string,
  locale: 'tr-TR' | 'en-US',
  onEnd: () => void
): Promise<void> {
  if (!('speechSynthesis' in window) || !text.trim()) {
    onEnd();
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = locale;

  const voices = cachedVoices.length > 0 ? cachedVoices : await loadVoices();
  const langPrefix = locale.split('-')[0];
  const match =
    voices.find((v) => v.lang.toLowerCase() === locale.toLowerCase()) ??
    voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix)) ??
    null;
  if (match) utterance.voice = match;
  // No matching voice found (e.g. no Turkish voice installed on this OS) —
  // fall back to whatever voice the browser defaults to rather than failing;
  // utterance.lang is still set so the browser makes its own best effort.

  utterance.onend = onEnd;
  utterance.onerror = onEnd;
  window.speechSynthesis.speak(utterance);
}
