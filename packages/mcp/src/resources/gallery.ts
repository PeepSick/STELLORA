import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { GalleryPhoto } from '../utils/markdown.js';

interface MemoryDay {
  dayKey: string;
  dateLabel: string;
  photos: GalleryPhoto[];
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
      dateLabel: dayKey === 'unknown' ? 'Unknown date' : dayKey,
      photos: dayPhotos,
    }));
}

export function registerGalleryResources(server: McpServer, getPhotos: () => GalleryPhoto[]) {
  server.resource(
    'gallery-index',
    'stellora://gallery',
    { mimeType: 'application/json', description: 'Index of all Stellora photo memory days' },
    async () => {
      const photos = getPhotos();
      const days = groupByDay(photos);
      const index = days.map((d) => ({
        dayKey: d.dayKey,
        dateLabel: d.dateLabel,
        photoCount: d.photos.length,
        files: d.photos.map((p) => p.filename),
      }));

      return {
        contents: [{ uri: 'stellora://gallery', mimeType: 'application/json', text: JSON.stringify(index, null, 2) }],
      };
    }
  );
}
