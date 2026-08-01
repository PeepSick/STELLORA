import { useCallback, useEffect, useState } from 'react';

export interface StellorPhotoNote {
  scene: string;
  tags: string[];
}

const STORAGE_PREFIX = 'stellora-photo-';

/** Synchronous read, safe to call outside React. Returns null if the user never overrode this photo. */
export function readStellorPhotoNote(filename: string): StellorPhotoNote | null {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + filename);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore corrupt storage
  }
  return null;
}

/**
 * Per-photo scene/tags are written by the memory's owner, not an AI vision
 * pipeline (Faz 2 decision) — only the person who was there knows what a
 * photo actually means. `seed` is the hand-written Faz-1 default (or empty
 * for new photos); a user edit overrides it permanently once made.
 */
export function useStellorPhotoNote(filename: string, seed: StellorPhotoNote) {
  const [override, setOverride] = useState<StellorPhotoNote | null>(() => readStellorPhotoNote(filename));

  // The panel doesn't remount when the slider moves to a different photo —
  // re-sync the override whenever the filename (i.e. the current photo) changes.
  useEffect(() => {
    setOverride(readStellorPhotoNote(filename));
  }, [filename]);

  const note = override ?? seed;

  const persist = useCallback(
    (next: StellorPhotoNote) => {
      localStorage.setItem(STORAGE_PREFIX + filename, JSON.stringify(next));
      setOverride(next);
    },
    [filename]
  );

  const updateScene = useCallback((scene: string) => persist({ ...(override ?? seed), scene }), [persist, override, seed]);

  const updateTags = useCallback(
    (tagsText: string) => {
      const tags = tagsText.split(',').map((t) => t.trim()).filter(Boolean);
      persist({ ...(override ?? seed), tags });
    },
    [persist, override, seed]
  );

  return { note, updateScene, updateTags };
}
