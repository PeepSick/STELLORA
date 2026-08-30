import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ParsedNote } from '../utils/markdown.js';
import type { GalleryPhoto } from '../utils/markdown.js';

export function registerGalaxyTools(
  server: McpServer,
  getNotes: () => ParsedNote[],
  getFinanceNotes: () => ParsedNote[],
  getPhotos: () => GalleryPhoto[]
) {
  server.tool(
    'galaxy_stats',
    'Get statistics about the Stellora galaxy — node counts, folder distribution, etc.',
    {},
    async () => {
      const notes = getNotes();
      const finance = getFinanceNotes();
      const photos = getPhotos();

      const folders = new Map<string, number>();
      for (const n of notes) {
        folders.set(n.folder, (folders.get(n.folder) ?? 0) + 1);
      }

      const folderList = Array.from(folders.entries())
        .map(([f, c]) => `- **${f}**: ${c} notes`)
        .join('\n');

      return {
        content: [
          {
            type: 'text' as const,
            text: `# Stellora Galaxy Stats\n\n## Knowledge Notes\n- **Total:** ${notes.length} notes\n- **By folder:**\n${folderList}\n\n## Finance Corpus\n- **Total:** ${finance.length} articles\n\n## Photo Gallery\n- **Total photos:** ${photos.length}\n\n## Sources\n- Knowledge Galaxy (business/ops/product/sourcing)\n- Finance Corpus (economy/finance)\n- Photo Gallery (gallery)`,
          },
        ],
      };
    }
  );

  server.tool(
    'galaxy_sources',
    'List all available data sources in the Stellora galaxy.',
    {},
    async () => {
      const notes = getNotes();
      const finance = getFinanceNotes();
      const photos = getPhotos();

      return {
        content: [
          {
            type: 'text' as const,
            text: `# Stellora Data Sources\n\n| Source | Type | Count | Description |\n|--------|------|-------|-------------|\n| Knowledge Galaxy | notes | ${notes.length} | Business, ops, product, sourcing markdown notes |\n| Finance Corpus | finance | ${finance.length} | Turkish economy/finance reference articles |\n| Photo Gallery | photos | ${photos.length} | Personal photo memories (grouped by day) |\n\nUse \`notes_search\`, \`finance_search\`, or \`gallery_search\` to query each source.`,
          },
        ],
      };
    }
  );
}
