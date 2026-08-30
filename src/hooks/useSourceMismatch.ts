const STORAGE_PREFIX = 'stellora-source-mismatch-';

/**
 * "SOURCE MISMATCH?" is a human judgment call, not something the app can
 * detect on its own (there's no ground truth to check a node's folder
 * against). So this is a simple manual flag — the viewer marks a node they
 * personally think is miscategorized, stored locally like the Stellora
 * Favorite/Important/Archived marks.
 */
export function isSourceMismatchFlagged(nodeId: string): boolean {
  try {
    return localStorage.getItem(STORAGE_PREFIX + nodeId) === '1';
  } catch {
    return false;
  }
}

export function toggleSourceMismatchFlag(nodeId: string): boolean {
  const next = !isSourceMismatchFlagged(nodeId);
  try {
    if (next) localStorage.setItem(STORAGE_PREFIX + nodeId, '1');
    else localStorage.removeItem(STORAGE_PREFIX + nodeId);
  } catch {
    // localStorage unavailable — flag just won't persist this session
  }
  return next;
}
