import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { GalleryPhoto } from '../utils/markdown.js';

interface MemoryDay {
  dayKey: string;
  dateLabel: string;
  photos: GalleryPhoto[];
  daySummary: string;
}

function groupByDay(photos: GalleryPhoto[]): MemoryDay[] {
  const byDay = new Map<string, GalleryPhoto[]>();

  for (const photo of photos) {
    const match = photo.filename.match(/^(\d{4})(\d{2})(\d{2})/);
    const dayKey = match ? `${match[1]}-${match[2]}-${match[3]}` : 'unknown';
    if (!byDay.has(dayKey)) byDay.set(dayKey, []);
    byDay.get(dayKey)!.push(photo);
  }

  return Array.from(byDay.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([dayKey, dayPhotos]) => ({
      dayKey,
      dateLabel: dayKey === 'unknown'
        ? 'Unknown date'
        : new Date(dayKey).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
      photos: dayPhotos,
      daySummary: `${dayKey === 'unknown' ? 'Unknown date' : dayKey} — ${dayPhotos.length} photos`,
    }));
}

export function registerGalleryTools(server: McpServer, getPhotos: () => GalleryPhoto[]) {
  server.tool(
    'gallery_search',
    'Search the Stellora photo memory gallery. Returns matching days/photos.',
    { query: z.string().describe('Search query (matches filename, date)'), limit: z.number().optional().describe('Max results to return (default 10)') },
    async ({ query, limit }) => {
      const photos = getPhotos();
      const maxResults = limit ?? 10;
      const days = groupByDay(photos);

      const queryLower = query.toLowerCase();
      const matched = days.filter((d) =>
        d.dayKey.includes(queryLower) ||
        d.dateLabel.toLowerCase().includes(queryLower) ||
        d.photos.some((p) => p.filename.toLowerCase().includes(queryLower))
      ).slice(0, maxResults);

      if (matched.length === 0) {
        return {
          content: [{ type: 'text' as const, text: `No photos found matching "${query}"` }],
        };
      }

      const results = matched.map((d) =>
        `## ${d.dateLabel}\n- **Day:** ${d.dayKey}\n- **Photos:** ${d.photos.length}\n- **Files:** ${d.photos.map((p) => p.filename).join(', ')}`
      ).join('\n\n---\n\n');

      return {
        content: [{ type: 'text' as const, text: `Found ${matched.length} memory days:\n\n${results}` }],
      };
    }
  );

  server.tool(
    'gallery_get',
    'Get details for a specific memory day from the Stellora gallery.',
    { dayKey: z.string().describe('Day key in YYYY-MM-DD format') },
    async ({ dayKey }) => {
      const photos = getPhotos();
      const days = groupByDay(photos);
      const day = days.find((d) => d.dayKey === dayKey);

      if (!day) {
        return {
          content: [{ type: 'text' as const, text: `No memory found for day: ${dayKey}` }],
          isError: true,
        };
      }

      const photoList = day.photos
        .map((p) => `- **${p.filename}** — ${p.filepath}`)
        .join('\n');

      return {
        content: [
          {
            type: 'text' as const,
            text: `# ${day.dateLabel}\n\n**Day:** ${day.dayKey}\n**Photos:** ${day.photos.length}\n\n## Photos\n\n${photoList}`,
          },
        ],
      };
    }
  );

  server.tool(
    'gallery_list',
    'List all memory days in the Stellora photo gallery.',
    {},
    async () => {
      const photos = getPhotos();
      const days = groupByDay(photos);

      if (days.length === 0) {
        return {
          content: [{ type: 'text' as const, text: 'No photos found in gallery.' }],
        };
      }

      const list = days
        .map((d) => `- **${d.dateLabel}** (${d.dayKey}) — ${d.photos.length} photos`)
        .join('\n');

      return {
        content: [{ type: 'text' as const, text: `# Stellora Photo Gallery (${days.length} days, ${photos.length} photos)\n\n${list}` }],
      };
    }
  );
}
