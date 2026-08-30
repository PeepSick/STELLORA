import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ParsedNote } from '../utils/markdown.js';

export function registerNoteResources(server: McpServer, getNotes: () => ParsedNote[]) {
  server.resource(
    'notes-index',
    'stellora://notes',
    { mimeType: 'application/json', description: 'Index of all Stellora knowledge notes' },
    async () => {
      const notes = getNotes();
      const index = notes.map((n) => ({
        id: n.id,
        title: n.title,
        folder: n.folder,
        description: n.description,
        wikiLinks: n.wikiLinks,
      }));

      return {
        contents: [{ uri: 'stellora://notes', mimeType: 'application/json', text: JSON.stringify(index, null, 2) }],
      };
    }
  );

  server.resource(
    'note-detail',
    new ResourceTemplate('stellora://notes/{id}', { list: undefined }),
    async (uri, { id }) => {
      const notes = getNotes();
      const note = notes.find((n) => n.id === id);

      if (!note) {
        return { contents: [{ uri: uri.href, mimeType: 'text/plain', text: `Note not found: ${id}` }] };
      }

      return {
        contents: [{ uri: uri.href, mimeType: 'text/markdown', text: `# ${note.title}\n\n${note.content}` }],
      };
    }
  );
}
