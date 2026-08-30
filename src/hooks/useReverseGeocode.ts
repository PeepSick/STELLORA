import { useEffect, useState } from 'react';
import { reverseGeocode } from '@/utils/reverseGeocode';
import { useTranslation } from '@/i18n';

/** Resolves GPS coordinates to a place name; returns null (raw coords should be shown instead) while loading or on failure/no-GPS. */
export function useReverseGeocode(gps: { lat: number; lon: number } | null): string | null {
  const [place, setPlace] = useState<string | null>(null);
  const { lang } = useTranslation();

  useEffect(() => {
    if (!gps) {
      setPlace(null);
      return;
    }
    let cancelled = false;
    setPlace(null);
    reverseGeocode(gps.lat, gps.lon, lang).then((label) => {
      if (!cancelled) setPlace(label);
    });
    return () => {
      cancelled = true;
    };
  }, [gps?.lat, gps?.lon, lang]);

  return place;
}
