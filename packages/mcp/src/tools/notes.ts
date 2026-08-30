import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ParsedNote } from '../utils/markdown.js';

export function registerNotesTools(server: McpServer, getNotes: () => ParsedNote[]) {
  server.tool(
    'notes_search',
    'Search the Stellora knowledge galaxy (markdown notes). Returns matching notes with title, description, and folder.',
    { query: z.string().describe('Search query (multi-word, fuzzy match on title + content)'), folder: z.string().optional().describe('Optional folder filter: business, ops, product, sourcing'), limit: z.number().optional().describe('Max results to return (default 10)') },
    async ({ query, folder, limit }) => {
      const notes = getNotes();
      const maxResults = limit ?? 10;

      let filtered = notes;
      if (folder) {
        filtered = notes.filter((n) => n.folder === folder);
      }

      const words = query.toLowerCase().split(/\s+/).filter(Boolean);

      const scored = filtered
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
          content: [{ type: 'text' as const, text: `No notes found matching "${query}"` }],
        };
      }

      const results = scored.map(({ note, score }) =>
        `## ${note.title}\n- **ID:** ${note.id}\n- **Folder:** ${note.folder}\n- **Score:** ${(score * 100).toFixed(0)}%\n- **Description:** ${note.description}\n- **WikiLinks:** ${note.wikiLinks.length > 0 ? note.wikiLinks.join(', ') : 'none'}`
      ).join('\n\n---\n\n');

      return {
        content: [{ type: 'text' as const, text: `Found ${scored.length} notes:\n\n${results}` }],
      };
    }
  );

  server.tool(
    'notes_read',
    'Read the full content of a Stellora note by its ID.',
    { id: z.string().describe('Note ID (kebab-case filename, e.g. "business-overview")') },
    async ({ id }) => {
      const notes = getNotes();
      const note = notes.find((n) => n.id === id);

      if (!note) {
        return {
          content: [{ type: 'text' as const, text: `Note not found: ${id}` }],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: 'text' as const,
            text: `# ${note.title}\n\n**Folder:** ${note.folder}\n**ID:** ${note.id}\n**WikiLinks:** ${note.wikiLinks.join(', ') || 'none'}\n\n---\n\n${note.content}`,
          },
        ],
      };
    }
  );

  server.tool(
    'notes_list',
    'List all Stellora knowledge notes with their metadata.',
    { folder: z.string().optional().describe('Optional folder filter: business, ops, product, sourcing') },
    async ({ folder }) => {
      const notes = getNotes();
      let filtered = notes;
      if (folder) {
        filtered = notes.filter((n) => n.folder === folder);
      }

      const list = filtered
        .map((n) => `- **${n.title}** (${n.id}) — ${n.folder} — ${n.wikiLinks.length} links`)
        .join('\n');

      return {
        content: [{ type: 'text' as const, text: `# Stellora Notes (${filtered.length} total)\n\n${list}` }],
      };
    }
  );
}
