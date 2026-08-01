import { useCallback, useState } from 'react';

export type StellorImportanceMark = 'favorite' | 'important' | 'archived' | null;

export interface StellorMemoryEdits {
  story: string;
  people: string[];
  mark: StellorImportanceMark;
}

const STORAGE_PREFIX = 'stellora-memory-';
const DEFAULT_EDITS: StellorMemoryEdits = { story: '', people: [], mark: null };

/** Synchronous read, safe to call outside React (e.g. inside the 3D node loop for Memory Score). */
export function readStellorMemory(nodeId: string): StellorMemoryEdits {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + nodeId);
    if (raw) return { ...DEFAULT_EDITS, ...JSON.parse(raw) };
  } catch {
    // ignore corrupt storage
  }
  return DEFAULT_EDITS;
}

/** Standalone write, for list views (e.g. Archive tab) that don't want a hook instance per row. */
export function writeStellorMark(nodeId: string, mark: StellorImportanceMark): void {
  const prev = readStellorMemory(nodeId);
  localStorage.setItem(STORAGE_PREFIX + nodeId, JSON.stringify({ ...prev, mark }));
}

/**
 * No backend exists for this app — user-written story/people/importance edits
 * for a Stellora memory node are persisted client-side only, per browser.
 */
export function useStellorMemory(nodeId: string) {
  const [memory, setMemory] = useState<StellorMemoryEdits>(() => readStellorMemory(nodeId));

  const persist = useCallback(
    (next: StellorMemoryEdits) => {
      localStorage.setItem(STORAGE_PREFIX + nodeId, JSON.stringify(next));
      setMemory(next);
    },
    [nodeId]
  );

  const updateStory = useCallback(
    (story: string) => persist({ ...readStellorMemory(nodeId), story }),
    [nodeId, persist]
  );

  const updatePeople = useCallback(
    (peopleText: string) => {
      const people = peopleText.split(',').map((p) => p.trim()).filter(Boolean);
      persist({ ...readStellorMemory(nodeId), people });
    },
    [nodeId, persist]
  );

  const setMark = useCallback(
    (mark: StellorImportanceMark) => {
      const prev = readStellorMemory(nodeId);
      persist({ ...prev, mark: prev.mark === mark ? null : mark });
    },
    [nodeId, persist]
  );

  return { memory, updateStory, updatePeople, setMark };
}
