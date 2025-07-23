// services/useBusyness.ts
import { useState, useEffect } from 'react';
import axios from 'axios';

// ------------------------------------------------------------------
//  Lightweight in‑memory cache (lat,lon → "low" | "med" | "high")
// ------------------------------------------------------------------

type CacheKey = string;               // "<lat>,<lon>,<timestamp?>"
export const cache = new Map<CacheKey, string>();  // holds only low|med|high

function key(lat: number, lon: number, ts?: string) {
  return `${lat},${lon}${ts ?? ''}`;
}

/**
 * One-shot helper – fetches *current* busyness for a coordinate.
 * Returns one of "low" | "med" | "high" (never throws).
 *
 *  • Uses the same /api/busyness endpoint as the React hook below.
 *  • Shares the cache, so callers pay the network cost at most once.
 */
export async function fetchBusynessLevel(lat: number, lon: number): Promise<string> {
  const k = key(lat, lon);            // ① quick path (cached)
  if (cache.has(k)) return cache.get(k)!;

  try {
    const { data } = await axios.get(`/api/busyness?lat=${lat}&lon=${lon}`);
    const value = Array.isArray(data) ? data[0]?.busynessLevel : data.busynessLevel;
    const raw   = value ?? 'unknown';

    if (raw !== 'unknown') cache.set(k, raw);   // ② populate cache only when API returned real data
    return raw === 'unknown' ? 'low' : raw;
  } catch {
    return 'low';
  }
}

/** React hook that returns the busyness level (or null while loading). */
export function useBusyness(
  lat: number | undefined,
  lon: number | undefined,
  timestamp?: string,
) {
  const [level, setLevel] = useState<string | null>(null);

  useEffect(() => {
    if (lat == null || lon == null) {
      setLevel(null);
      return;
    }

    const k = key(lat, lon, timestamp);

    // Use cached value if we have it
    if (cache.has(k)) {
      setLevel(cache.get(k)!);
      return;
    }

    // Otherwise fetch & cache (unless it's "unknown")
    let cancelled = false;

    (async () => {
      try {
        let url = `/api/busyness?lat=${lat}&lon=${lon}`;
        if (timestamp) url += `&timestamp=${timestamp}`;

        const { data } = await axios.get(url);
        const value = Array.isArray(data) ? data[0]?.busynessLevel : data.busynessLevel;
        const raw   = value ?? 'unknown';

        const final = raw === 'unknown' ? 'low' : raw;

        if (!cancelled) setLevel(final);
        if (raw !== 'unknown') cache.set(k, raw);   // 👉 only cache real answers
      } catch {
        if (!cancelled) setLevel('low');
      }
    })();

    return () => { cancelled = true; };
  }, [lat, lon, timestamp]);

  return level;     // "low" | "med" | "high" | null (loading)
}
