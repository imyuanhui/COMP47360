/****************************************************************************************
 * googlePlaces.ts
 * ------------------------------------------------------------------
 * Thin client-side wrapper for *your own* backend proxy endpoints
 * (`/api/places`  +  `/api/nearby`).  The browser never calls Google
 * Places directly — that keeps API keys hidden on the server side.
 *
 *  Public helpers
 *  ──────────────
 *    fetchPlaces(query, filters[])           Text search
 *    fetchRandomTouristPlaces(latLng, n)     Nearby Search + shuffle (optional)
 *
 *  Both helpers normalise the backend’s raw Google response into the
 *  shared <Place> model used throughout the UI.
 *
 *  Assumptions
 *  ───────────
 *    • Your backend accepts the same query-string params shown below and
 *      returns either `{ results: [...] }` or `[...]` directly.
 *    • The project exposes VITE_GOOGLE_MAPS_API_KEY for photo URLs.
 *****************************************************************************************/

import type { Place } from '../types';

/* =========================================================================
 * 1. fetchPlaces() – text search via /api/places
 * =========================================================================*/
export async function fetchPlaces(query: string, filters: string[]): Promise<Place[]> {
  const url =
    '/api/places?' +
    new URLSearchParams({
      query,
      filters: filters.join(','),     // backend can split by “,”
      lat: '40.7831',
      lng: '-73.9712',                // Manhattan default centre
    });

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Backend returned ${res.status}`);

  /* backend may wrap results in {results:[]} or return the array directly */
  const payload = await res.json();
  const results = payload.results ?? payload;

  /* normalise → <Place> */
  return results.map((r: any): Place => ({
    id:      r.place_id,
    name:    r.name,
    address: r.formatted_address,
    lat:     r.geometry.location.lat,
    lng:     r.geometry.location.lng,

    /* Build photo URL using same API key (served from backend) */
    imageUrl: r.photos?.[0]
      ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${r.photos[0].photo_reference}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
      : '/placeholder.jpg',

    crowdTime: '18:00',          // placeholder until real analytics
    rating:    r.rating ?? 0,
    travel:    { walk: 0, drive: 0, transit: 0 },  // computed later
  }));
}

/* =========================================================================
 * 2. fetchRandomTouristPlaces() – nearby search + Fisher-Yates shuffle
 * =========================================================================
 * Handy for a “Surprise me” or default recommendations feature.
 * Feel free to delete if not needed.
 * -------------------------------------------------------------------------*/
export async function fetchRandomTouristPlaces(
  latLng: google.maps.LatLngLiteral,
  count  = 10,
): Promise<Place[]> {
  const url =
    '/api/nearby?' +
    new URLSearchParams({
      lat: String(latLng.lat),
      lng: String(latLng.lng),
      type: 'tourist_attraction',
      radius: '10000',      // 10 km
    });

  const res = await fetch(url);
  if (!res.ok) return [];   // fail silently for now
  const { results } = await res.json();

  /* shuffle in-place (Fisher–Yates) then slice */
  for (let i = results.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [results[i], results[j]] = [results[j], results[i]];
  }

  return results.slice(0, count).map((p: any): Place => ({
    id:      p.place_id,
    name:    p.name,
    address: p.vicinity ?? '',
    lat:     p.geometry.location.lat,
    lng:     p.geometry.location.lng,
    imageUrl: p.photos?.[0]
      ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${p.photos[0].photo_reference}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
      : '/placeholder.jpg',
    crowdTime: '',
    rating:    p.rating ?? 0,
    travel:    { walk: 0, drive: 0, transit: 0 },
  }));
}
