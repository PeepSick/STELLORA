import { readStellorMemory } from '@/hooks/useStellorMemory';
import type { StellorMemoryMetadata } from '@/types';

/**
 * Memory Score — how much a memory node's 3D star should stand out.
 * Photo count alone isn't a good proxy for what matters to the owner: a
 * one-photo birthday with a long story should read bigger than an
 * 80-photo day nobody wrote anything about. Hidden from the UI; only
 * expressed as star size.
 */
export function computeMemoryScore(nodeId: string, meta: StellorMemoryMetadata): number {
  const edits = readStellorMemory(nodeId);
  let score = meta.photos.length;
  score += Math.min(edits.story.length / 80, 10);
  if (edits.mark === 'favorite') score += 8;
  else if (edits.mark === 'important') score += 5;
  else if (edits.mark === 'archived') score -= 6;
  return Math.max(1, score);
}

/** Maps a Memory Score to a scale multiplier applied on top of the base orb size. */
export function memoryScoreToScaleFactor(score: number): number {
  return 1 + Math.min(score / 20, 0.9);
}
