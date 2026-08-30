import type { StellarisNode } from '@/types';

/**
 * Which corpus/folder a node's data actually came from — independent of its
 * visual `type` (a business note and a product note can both render as
 * different orb types, but "source" answers "which folder did this come
 * from" for the hover tag.
 */
export type NodeSourceCategory =
  | 'business' | 'ops' | 'product' | 'sourcing' | 'finance'
  | 'stellora' | 'music' | 'git' | 'knowledge';

export function getNodeSourceCategory(node: StellarisNode): NodeSourceCategory {
  const meta = node.metadata as Record<string, unknown> | undefined;
  if (Array.isArray(meta?.photos)) return 'stellora';
  if (node.type === 'commit') return 'git';
  if (node.type === 'audio') return 'music';

  const folder = meta?.folder as string | undefined;
  if (folder === 'finance' || folder === 'economy') return 'finance';
  if (folder === 'business' || folder === 'ops' || folder === 'product' || folder === 'sourcing') {
    return folder;
  }
  return 'knowledge';
}

/** i18n key for the human-readable source label — look up with t(). */
export function getNodeSourceLabelKey(node: StellarisNode): string {
  const category = getNodeSourceCategory(node);
  const keys: Record<NodeSourceCategory, string> = {
    business: 'sourceBusiness',
    ops: 'sourceOps',
    product: 'sourceProduct',
    sourcing: 'sourceSourcing',
    finance: 'sourceFinanceCorpus',
    stellora: 'sourceStelloraMemory',
    music: 'sourceMusicGalaxy',
    git: 'sourceGitGalaxy',
    knowledge: 'sourceKnowledge',
  };
  return keys[category];
}
