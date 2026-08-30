const CACHE_PREFIX = 'stellora-geocode-';

// ~110m grid — plenty precise for "which town was this photo taken in" while
// keeping the cache small and request volume low (Nominatim usage policy: 1 req/s, be a good citizen).
// Language is part of the key too — otherwise switching the app language
// would keep showing whichever language's place name got cached first.
function cacheKey(lat: number, lon: number, lang: string): string {
  return `${CACHE_PREFIX}${lang}-${lat.toFixed(3)},${lon.toFixed(3)}`;
}

interface NominatimAddress {
  city?: string;
  town?: string;
  village?: string;
  county?: string;
  state?: string;
  country?: string;
}

function formatAddress(addr: NominatimAddress): string {
  const locality = addr.city || addr.town || addr.village || addr.county || addr.state;
  return [locality, addr.country].filter(Boolean).join(', ');
}

/**
 * Faz 2 decision: free OpenStreetMap/Nominatim, not paid Google Maps.
 * Client-side only, no backend — result cached in localStorage per ~110m
 * grid cell so the same photo/day never re-fetches, and repeat visits to
 * nearby memories usually hit cache instead of the network.
 */
export async function reverseGeocode(lat: number, lon: number, lang: 'en' | 'tr' = 'en'): Promise<string | null> {
  const key = cacheKey(lat, lon, lang);
  try {
    const cached = localStorage.getItem(key);
    if (cached) return cached === '__empty__' ? null : cached;
  } catch {
    // ignore storage errors, fall through to network
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1&accept-language=${lang}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    const data = await res.json();
    const label = data?.address ? formatAddress(data.address) : null;
    try {
      localStorage.setItem(key, label ?? '__empty__');
    } catch {
      // storage full or unavailable — non-fatal, just skip caching
    }
    return label;
  } catch {
    return null;
  }
}
