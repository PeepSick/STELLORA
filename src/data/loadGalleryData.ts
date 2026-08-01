import { parse as parseExif } from 'exifr';
import type { StellarisNode, StellarisConnection, StellorPhotoMetadata, StellorMemoryMetadata } from '@/types';

// Actual gallery photos, served as URLs by Vite (not inlined/parsed as text)
const photoModules = import.meta.glob('/src/data/galery/*.{jpg,jpeg,png}', {
  query: '?url',
  import: 'default',
  eager: true,
}) as Record<string, string>;

/**
 * Seed defaults only — a one-time hand-written pass for the first 9 photos.
 * The owner can rewrite scene/tags per photo in the panel (Faz 2: no AI
 * pipeline, the person who lived the memory writes it); user edits are
 * stored in localStorage and take priority over these, see
 * useStellorPhotoNote. New photos with no entry here start blank, editable.
 * No automated face/identity recognition — person counts only, no identity
 * claims (see PROJELER.md).
 */
const PHOTO_NOTES: Record<string, { scene: string; tags: string[]; peopleObserved: number }> = {
  '20160814_213918.jpg': {
    scene: 'İç mekan, pencere kenarı, sıcak gündüz ışığı — iki kişilik selfie.',
    tags: ['indoor', 'window-light', 'selfie'],
    peopleObserved: 2,
  },
  '20161202_210047.jpg': {
    scene: 'Gece, renkli (pembe/amber) atmosfer ışıklandırmalı bir mekan — iki kişilik selfie.',
    tags: ['indoor', 'night', 'venue', 'selfie'],
    peopleObserved: 2,
  },
  '20190817_201626.jpg': {
    scene: 'Araç içi, gündüz — sürücü koltuğunda, dışarıda yeşillik ve çit görünüyor.',
    tags: ['car', 'daytime', 'driving'],
    peopleObserved: 1,
  },
  '20190818_013852.jpg': {
    scene: 'İç mekan, merdiven/jaluzi arka planı — iki kişilik gülümseyen selfie.',
    tags: ['indoor', 'staircase', 'selfie'],
    peopleObserved: 2,
  },
  '20190818_013857.jpg': {
    scene: 'Aynı iç mekan (merdiven/jaluzi), yakın çekim iki kişilik selfie.',
    tags: ['indoor', 'staircase', 'selfie', 'close-up'],
    peopleObserved: 2,
  },
  '20190819_132508.jpg': {
    scene: 'Dış mekan, güneşli gün — bir araç yolunda iki araç, kırmızı kiremitli Avrupa mimarisi evler.',
    tags: ['outdoor', 'cars', 'architecture', 'daytime'],
    peopleObserved: 0,
  },
  '20190819_192251.jpg': {
    scene: 'Dış mekan, akşam altın saat ışığı — bahçe/veranda, demir dökme mobilyalar, kırmızı çatılı evler arka planda.',
    tags: ['outdoor', 'golden-hour', 'garden', 'selfie'],
    peopleObserved: 1,
  },
  '20190824_182743.jpg': {
    scene: 'Dış mekan, güneşli — bir araç yanında, araç yolu, kırmızı çatılı evler arka planda.',
    tags: ['outdoor', 'car', 'daytime'],
    peopleObserved: 1,
  },
  '20191012_135556.jpg': {
    scene: 'İç mekan, düz duvar arka planı — iki kişilik yakın selfie.',
    tags: ['indoor', 'selfie', 'close-up'],
    peopleObserved: 2,
  },
};

/** One-line hand-written synthesis per day — not live-generated (see Phase 2 in PROJELER.md). */
const DAY_SUMMARIES: Record<string, string> = {
  '2016-08-14': 'Sıcak bir öğleden sonra, pencere kenarında iki kişilik bir an.',
  '2016-12-02': 'Gece, renkli ışıklar altında bir mekanda geçen an.',
  '2019-08-17': 'Araç içinde, yeşilliklerin arasında sakin bir gündüz anı.',
  '2019-08-18': 'İç mekanda, merdiven başında geçen gülümseyen bir an.',
  '2019-08-19': 'Güneşli bir gün — yeni bir araç ve akşamüstü bahçede huzurlu bir vakit.',
  '2019-08-24': 'Güneşli bir günde, araç yanında geçen kısa bir an.',
  '2019-10-12': 'İç mekanda yakın çekim, samimi bir an.',
};

/** Parses the Android camera filename convention YYYYMMDD_HHMMSS as a fallback when EXIF has no date. */
function dateFromFilename(filename: string): string | null {
  const m = filename.match(/^(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/);
  if (!m) return null;
  const [, y, mo, d, h, mi, s] = m;
  return `${y}-${mo}-${d}T${h}:${mi}:${s}`;
}

function dayKeyFromIso(iso: string): string {
  return iso.slice(0, 10);
}

async function buildPhotoMeta(filepath: string, url: string): Promise<{ dayKey: string; meta: StellorPhotoMetadata }> {
  const filename = filepath.split('/').pop() || 'photo.jpg';
  const notes = PHOTO_NOTES[filename] ?? { scene: 'Galeri fotoğrafı.', tags: [], peopleObserved: 0 };

  let dateTaken: string | null = null;
  let camera: string | null = null;
  let lens: string | null = null;
  let iso: number | null = null;
  let focalLength: number | null = null;
  let fNumber: number | null = null;
  let resolution: { width: number; height: number } | null = null;
  let gps: { lat: number; lon: number } | null = null;

  try {
    const exif = await parseExif(url, { tiff: true, exif: true, gps: true });
    if (exif?.DateTimeOriginal instanceof Date) {
      dateTaken = exif.DateTimeOriginal.toISOString();
    }
    if (exif?.Make || exif?.Model) {
      camera = [exif.Make, exif.Model].filter(Boolean).join(' ');
    }
    if (exif?.LensModel) lens = String(exif.LensModel);
    if (typeof exif?.ISO === 'number') iso = exif.ISO;
    if (typeof exif?.FocalLength === 'number') focalLength = exif.FocalLength;
    if (typeof exif?.FNumber === 'number') fNumber = exif.FNumber;
    const width = exif?.ExifImageWidth ?? exif?.PixelXDimension;
    const height = exif?.ExifImageHeight ?? exif?.PixelYDimension;
    if (typeof width === 'number' && typeof height === 'number') {
      resolution = { width, height };
    }
    if (typeof exif?.latitude === 'number' && typeof exif?.longitude === 'number') {
      gps = { lat: exif.latitude, lon: exif.longitude };
    }
  } catch {
    // No EXIF, or stripped by a messaging app — fall back to filename date below.
  }

  const fallbackDate = dateFromFilename(filename);
  const effectiveDate = dateTaken ?? fallbackDate;
  const dayKey = effectiveDate ? dayKeyFromIso(effectiveDate) : 'unknown';

  const meta: StellorPhotoMetadata = {
    imageUrl: url,
    filename,
    dateTaken,
    camera,
    lens,
    iso,
    focalLength,
    fNumber,
    resolution,
    gps,
    scene: notes.scene,
    tags: notes.tags,
    peopleObserved: notes.peopleObserved,
  };

  return { dayKey, meta };
}

/**
 * Loads the Stellora gallery as one node PER DAY (not per photo) — each node
 * carries every photo taken that day in metadata.photos[]. This is the
 * Phase 1 fix: a 30-photo day is one node with a browsable gallery inside,
 * not 30 separate 3D orbs. Real EXIF via exifr + a one-time hand-written
 * scene/person-count pass. No face/identity recognition (see PROJELER.md).
 */
export async function loadGalleryNodesAndConnections(): Promise<{
  nodes: StellarisNode[];
  connections: StellarisConnection[];
}> {
  const entries = Object.entries(photoModules);
  const results = await Promise.all(entries.map(([filepath, url]) => buildPhotoMeta(filepath, url)));

  const byDay = new Map<string, StellorPhotoMetadata[]>();
  results.forEach(({ dayKey, meta }) => {
    if (!byDay.has(dayKey)) byDay.set(dayKey, []);
    byDay.get(dayKey)!.push(meta);
  });

  const nodes: StellarisNode[] = [];
  byDay.forEach((photos, dayKey) => {
    photos.sort((a, b) => (a.dateTaken ?? '').localeCompare(b.dateTaken ?? ''));

    const dateLabel = dayKey === 'unknown'
      ? 'Bilinmeyen tarih'
      : new Date(dayKey).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

    const peopleObserved = photos.reduce((max, p) => Math.max(max, p.peopleObserved), 0);
    const daySummary = DAY_SUMMARIES[dayKey] ?? (photos[0]?.scene || 'Galeri anısı.');

    const metadata: StellorMemoryMetadata = {
      dayKey,
      dateLabel,
      photos,
      peopleObserved,
      daySummary,
    };

    nodes.push({
      id: 'memory-' + dayKey,
      title: dateLabel,
      description: daySummary,
      type: 'event',
      tags: ['memory', dayKey],
      importance: Math.min(5, 2 + photos.length),
      connections: [],
      metadata: metadata as unknown as Record<string, unknown>,
    });
  });

  return { nodes, connections: [] };
}
