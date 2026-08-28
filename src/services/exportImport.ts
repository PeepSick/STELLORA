import type { StellarisNode, StellarisConnection, FeatureSettings, AiProviderId, AiProviderSettings } from '@/types';

// localStorage helpers for the bits that live outside the Zustand store
const STELLOR_MARK_PREFIX = 'stellora-mark-';
const AI_CONFIG_STORAGE_KEY = 'stellora-ai-config';

export interface GalaxyExport {
  version: 1;
  exportedAt: string;
  nodes: StellarisNode[];
  connections: StellarisConnection[];
  features: FeatureSettings;
  aiConfig: { activeProvider: AiProviderId; providers: Record<AiProviderId, AiProviderSettings> } | null;
  stellorMarks: Record<string, string>;
}

function readStellorMarks(): Record<string, string> {
  const marks: Record<string, string> = {};
  if (typeof localStorage === 'undefined') return marks;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(STELLOR_MARK_PREFIX)) {
      marks[key] = localStorage.getItem(key) || '';
    }
  }
  return marks;
}

function readAiConfig() {
  try {
    const raw = localStorage.getItem(AI_CONFIG_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Build a serializable snapshot of the current galaxy and trigger a download. */
export function exportGalaxy(data: Omit<GalaxyExport, 'version' | 'exportedAt'>): void {
  const payload: GalaxyExport = {
    version: 1,
    exportedAt: new Date().toISOString(),
    ...data,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `stellora-galaxy-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Parse an uploaded JSON file back into a GalaxyExport object. */
export function importGalaxyFile(file: File): Promise<GalaxyExport> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!parsed || !Array.isArray(parsed.nodes)) throw new Error('Invalid galaxy file');
        resolve(parsed as GalaxyExport);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

export { readStellorMarks, readAiConfig, STELLOR_MARK_PREFIX };
