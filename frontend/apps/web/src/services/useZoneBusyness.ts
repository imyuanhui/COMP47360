import { useEffect, useState } from 'react';
import zoneData from '../data/zoneBusyness.json';

interface Zone {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

interface ScoredZone extends Zone {
  rating: 'low' | 'medium' | 'high';
}

/**
 * Simulates zone busyness by assigning each zone a random prediction
 * and returning it as a scored zone. Used for frontend display.
 */
export function useZoneBusyness(show: boolean): ScoredZone[] {
  const [zones, setZones] = useState<ScoredZone[]>([]);

  useEffect(() => {
    if (!show) {
      setZones([]);
      return;
    }

    const parsedZones: Zone[] = zoneData.map(z => ({
      id: z.zone_id,
      name: z.zone_name,
      lat: parseFloat(z.lat),
      lng: parseFloat(z.lon),
    }));

    const scored = parsedZones.map(z => {
      const rating = (
        ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]
      ) as ScoredZone['rating'];

      return { ...z, rating };
    });

    setZones(scored);
  }, [show]);

  return zones;
}
