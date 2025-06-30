// src/services/googlePlaces.ts
import type { Place } from '../types';

/**
 * Main “search” helper.
 * - When `query` === '' we fetch a broad set of POIs and let the caller shuffle.
 * - Otherwise we pass the query and optional `filters` straight to your backend
 *   proxy (`/api/places`) which in turn calls Google.
 */
export async function fetchPlaces(
  query: string,
  filters: string[],
): Promise<Place[]> {
  const url =
    '/api/places?' +
    new URLSearchParams({
      query,
      filters: filters.join(','), // backend can split on ,
      lat: '40.7831',
      lng: '-73.9712',
    });

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Backend returned ${res.status}`);
  const data = await res.json();            // your backend’s response shape
  const results = data.results ?? data;     // adjust if needed

  return results.map((r: any): Place => ({
    id: r.place_id,
    name: r.name,
    address: r.formatted_address,
    lat: r.geometry.location.lat,
    lng: r.geometry.location.lng,
  
    /* consistent names ↓ */
    imageUrl: r.photos?.[0]
      ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${r.photos[0].photo_reference}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
      : '/placeholder.jpg',
  
    crowdTime: '18:00',
    rating:    r.rating ?? 0,
  
    /* NEW: give the card something to read */
    travel: { walk: 0, drive: 0, transit: 0 },
  }));
}

/* -----------------------------------------------------------------
   OPTIONAL helper: nearby tourist attractions via backend proxy
   (keep if you want a random-recommendations feature later)
------------------------------------------------------------------ */
export async function fetchRandomTouristPlaces(
  latLng: google.maps.LatLngLiteral,
  count = 10,
): Promise<Place[]> {
  const url =
    '/api/nearby?' +
    new URLSearchParams({
      lat: String(latLng.lat),
      lng: String(latLng.lng),
      type: 'tourist_attraction',
      radius: '10000',
    });

  const res = await fetch(url);
  if (!res.ok) return [];
  const { results } = await res.json();

  /* Fisher–Yates shuffle then slice */
  for (let i = results.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [results[i], results[j]] = [results[j], results[i]];
  }

  return results.slice(0, count).map((p: any) => ({
    id: p.place_id,
    name: p.name,
    address: p.vicinity ?? '',
    lat: p.geometry.location.lat,
    lng: p.geometry.location.lng,
    imageUrl:
      p.photos?.[0]
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${p.photos[0].photo_reference}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
        : '/placeholder.jpg',
    crowdTime: '',
    rating: p.rating ?? 0,
    travel: { walk: 0, drive: 0, transit: 0 },
  }));
}
