import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ParsedNote } from '../utils/markdown.js';

export function registerFinanceTools(server: McpServer, getFinanceNotes: () => ParsedNote[]) {
  server.tool(
    'finance_search',
    'Search the Stellora finance/economy corpus (1661 Turkish economy articles).',
    { query: z.string().describe('Search query (multi-word, fuzzy match)'), limit: z.number().optional().describe('Max results to return (default 10)') },
    async ({ query, limit }) => {
      const notes = getFinanceNotes();
      const maxResults = limit ?? 10;

      const words = query.toLowerCase().split(/\s+/).filter(Boolean);

      const scored = notes
        .map((note) => {
          const searchText = `${note.title} ${note.description} ${note.content}`.toLowerCase();
          const matches = words.filter((w: string) => searchText.includes(w));
          return { note, score: matches.length / words.length };
        })
        .filter((s) => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, maxResults);

      if (scored.length === 0) {
        return {
          content: [{ type: 'text' as const, text: `No finance articles found matching "${query}"` }],
        };
      }

      const results = scored.map(({ note, score }) =>
        `## ${note.title}\n- **ID:** ${note.id}\n- **Score:** ${(score * 100).toFixed(0)}%\n- **Description:** ${note.description}`
      ).join('\n\n---\n\n');

      return {
        content: [{ type: 'text' as const, text: `Found ${scored.length} finance articles:\n\n${results}` }],
      };
    }
  );
}
