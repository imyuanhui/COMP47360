/****************************************************************************************
 * usePlacesSearch.ts
 * ------------------------------------------------------------------
 * Custom React hook that wraps the Google Places SDK with
 * developer-friendly async helpers.
 *
 *  Exposed API
 *  ───────────
 *    isReady              true once the SDK + PlacesService are initialised
 *    loadError            any error returned by useLoadScript
 *    fetchRandomPlaces()  returns 10 shuffled tourist attractions (Nearby Search)
 *    searchText()         full-text search with optional filter keywords
 *
 *  Requirements
 *  ────────────
 *    • VITE_GOOGLE_MAPS_API_KEY – provided via Vite env
 *    • A parent component must be rendered inside a browser (window.google)
 *****************************************************************************************/

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLoadScript } from '@react-google-maps/api';
import type { Place } from '../types';

export function usePlacesSearch() {
  /* ------------------------------------------------------------------
   * 1. Load Google Maps JS SDK (+ Places library) via script tag
   * ------------------------------------------------------------------*/
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY!,
    libraries: ['places'],
  });

  /* ------------------------------------------------------------------
   * 2. Initialise PlacesService once SDK is ready
   * ------------------------------------------------------------------*/
  const serviceRef = useRef<google.maps.places.PlacesService | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isLoaded || serviceRef.current) return;          // guard: SDK still loading or already set

    /* PlacesService requires an *HTML element*; we never attach it to DOM */
    serviceRef.current = new google.maps.places.PlacesService(
      document.createElement('div'),
    );
    setIsReady(true);
  }, [isLoaded]);

  /* ------------------------------------------------------------------
   * 3. Map raw Google PlaceResult → our internal <Place> model
   * ------------------------------------------------------------------*/
  const toPlace = (r: google.maps.places.PlaceResult): Place => ({
    id:      r.place_id ?? '',
    name:    r.name ?? 'Unnamed',
    address: (r.vicinity || r.formatted_address) ?? '',
    lat:     r.geometry?.location?.lat() ?? 0,
    lng:     r.geometry?.location?.lng() ?? 0,
    rating:  (r as any).rating ?? 0,
    imageUrl: r.photos?.[0]?.getUrl({ maxWidth: 400, maxHeight: 300 })
            ?? '/placeholder.jpg',
    travel:  { walk: 0, drive: 0, transit: 0 },
  });

  /* ------------------------------------------------------------------
   * 4a. fetchRandomPlaces() : Nearby Search → shuffle → top-10
   * ------------------------------------------------------------------*/
  const fetchRandomPlaces = useCallback(
    (location: google.maps.LatLngLiteral, radius = 25_000): Promise<Place[]> =>
      new Promise((resolve, reject) => {
        const svc = serviceRef.current;
        if (!svc) return reject('service not ready');

        const req: google.maps.places.PlaceSearchRequest = {
          location,
          radius,
          type: 'tourist_attraction OR museum OR restaurant OR cafe',
        };

        svc.nearbySearch(req, (results, status) => {
          if (status !== google.maps.places.PlacesServiceStatus.OK || !results)
            return reject(status);

          const shuffled = [...results].sort(() => Math.random() - 0.5).slice(0, 20);
          resolve(shuffled.map(toPlace));
        });
      }),
    [],
  );

  /* ------------------------------------------------------------------
   * 4b. searchText() : Text Search with optional keyword filters
   * ------------------------------------------------------------------*/
  const searchText = useCallback(
    (
      query: string,
      location: google.maps.LatLngLiteral,
      filters: string[] = [],
      radius = 5_000,
    ): Promise<Place[]> =>
      new Promise((resolve, reject) => {
        const svc = serviceRef.current;
        if (!svc) return reject('service not ready');

        const req: google.maps.places.TextSearchRequest = {
          location,
          radius,
          query: filters.length ? `${filters.join(' ')} ${query}` : query,
        };

        svc.textSearch(req, (results, status) => {
          if (status !== google.maps.places.PlacesServiceStatus.OK || !results)
            return reject(status);

          resolve(results.map(toPlace));
        });
      }),
    [],
  );

  /* ------------------------------------------------------------------
   * 5. Public surface
   * ------------------------------------------------------------------*/
  return { isReady, loadError, fetchRandomPlaces, searchText };
}
