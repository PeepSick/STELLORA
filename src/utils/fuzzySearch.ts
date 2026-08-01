import { StellarisNode, SearchResult } from '@/types';

export function fuzzySearch(query: string, nodes: StellarisNode[]): SearchResult[] {
  if (!query.trim()) return [];
  
  const searchTerms = query.toLowerCase().split(' ').filter(Boolean);
  
  const results = nodes.map(node => {
    let score = 0;
    
    const title = node.title.toLowerCase();
    const description = (node.description || '').toLowerCase();
    const type = node.type.toLowerCase();
    const tags = (node.tags || []).map(t => t.toLowerCase());

    searchTerms.forEach(term => {
      // Exact matches
      if (title === term) score += 20;
      if (tags.includes(term)) score += 10;
      
      // Partial matches
      if (title.includes(term)) score += 10;
      if (tags.some(t => t.includes(term))) score += 5;
      if (description.includes(term)) score += 3;
      if (type.includes(term)) score += 1;
    });

    // Boost score by node importance
    score = score * (0.8 + (node.importance * 0.4));
    
    // Normalize score roughly between 0 and 1
    const normalizedScore = Math.min(score / 40, 1);

    return { node, score: normalizedScore, matchField: 'title' };
  });

  return results
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20); // Top 20 results
}

const RECENT_SEARCHES_KEY = 'stellaris_recent_searches';
const MAX_RECENT = 10;

export function getRecentSearches(): string[] {
  try {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function saveRecentSearch(query: string) {
  if (!query.trim()) return;
  const current = getRecentSearches();
  const updated = [query, ...current.filter(q => q !== query)].slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
}
