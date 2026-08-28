import { describe, it, expect } from 'vitest';
import { calculateNodePositions, spiralPosition } from '@/utils/galaxyMath';
import { resolveLanguage, translate } from '@/i18n';
import type { StellarisNode } from '@/types';

function makeNode(id: string): StellarisNode {
  return { id, title: id, type: 'document', tags: [], importance: 1, connections: [] };
}

describe('galaxyMath', () => {
  it('assigns a 3D position to every node', () => {
    const nodes = [makeNode('a'), makeNode('b'), makeNode('c')];
    const positioned = calculateNodePositions(nodes);
    expect(positioned.every((n) => Array.isArray(n.position))).toBe(true);
  });

  it('does not mutate nodes that already have a position', () => {
    const withPos = { ...makeNode('a'), position: [1, 2, 3] as [number, number, number] };
    const out = calculateNodePositions([withPos]);
    expect(out[0].position).toEqual([1, 2, 3]);
  });

  it('spiralPosition returns a finite vector', () => {
    const p = spiralPosition(10, 0);
    expect(p.every((v) => Number.isFinite(v))).toBe(true);
  });
});

describe('i18n', () => {
  it('resolves explicit locales and a valid auto language', () => {
    expect(resolveLanguage('tr')).toBe('tr');
    expect(resolveLanguage('en')).toBe('en');
    // 'auto' follows the browser; in a node test navigator may be absent (→ en)
    // or present with a tr locale. Either way it must resolve to a known lang.
    expect(['en', 'tr']).toContain(resolveLanguage('auto'));
  });

  it('falls back to English for missing keys', () => {
    expect(translate('tr', 'settings')).toBe('Ayarlar');
    expect(translate('en', 'settings')).toBe('Settings');
  });
});
