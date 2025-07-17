// services/useBusyness.ts
import { useState, useEffect } from 'react';
import axios from 'axios';

type CacheKey = string;               // "<lat>,<lon>,<timestamp?>"
export const cache = new Map<CacheKey, string>();  // holds only low|med|high

function key(lat: number, lon: number, ts?: string) {
  return `${lat},${lon}${ts ?? ''}`;
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

    // 1️⃣  Use cached value if we have it
    if (cache.has(k)) {
      setLevel(cache.get(k)!);
      return;
    }

    // 2️⃣  Otherwise fetch & cache (unless it's "unknown")
    let cancelled = false;

    (async () => {
      try {
        let url = `/api/busyness?lat=${lat}&lon=${lon}`;
        if (timestamp) url += `&timestamp=${timestamp}`;

        const { data } = await axios.get(url);
        const value = Array.isArray(data) ? data[0]?.busynessLevel : data.busynessLevel;
        const val   = value ?? 'unknown';

        if (!cancelled) setLevel(val);
        if (val !== 'unknown') cache.set(k, val);   // 👉 only cache real answers
      } catch {
        if (!cancelled) setLevel('unknown');
      }
    })();

    return () => { cancelled = true; };
  }, [lat, lon, timestamp]);

  return level;     // "low" | "med" | "high" | "unknown" | null (loading)
}
