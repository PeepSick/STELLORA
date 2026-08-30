import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ParsedNote } from '../utils/markdown.js';

export function registerFinanceResources(server: McpServer, getFinanceNotes: () => ParsedNote[]) {
  server.resource(
    'finance-index',
    'stellora://finance',
    { mimeType: 'application/json', description: 'Index of the Stellora finance/economy corpus' },
    async () => {
      const notes = getFinanceNotes();
      const index = notes.map((n) => ({
        id: n.id,
        title: n.title,
        description: n.description,
      }));

      return {
        contents: [{ uri: 'stellora://finance', mimeType: 'application/json', text: JSON.stringify(index, null, 2) }],
      };
    }
  );
}
