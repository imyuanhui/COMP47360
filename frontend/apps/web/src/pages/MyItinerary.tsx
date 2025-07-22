/**********************************************************************
 * MyItinerary.tsx  — v3
 * --------------------------------------------------------------------
 * Displays a user’s itinerary for a specific trip.
 *
 *     2025-07-22 — Exact-time slots
 *     • Hour-bucketing removed: we now display **every distinct HH:mm**
 *       that exists in the data (AI-generated times + manual picks).
 *     • The left-hand column headings show 09:15, 10:40, … in true
 *       chronological order.
 *     • “Remove from My Itinerary” passes the unrounded time back to
 *       `useItinerary.remove( id, time )` so deletions work as before.
 *     • Google-Maps export orders waypoints by the exact visit time.
 *
 *********************************************************************/

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout     from '../components/Layout';
import PlaceCard  from '../components/PlaceCard';
import MapPane    from '../components/MapPane';
import { useItinerary } from '../services/useItinerary';
import { fetchTripDetails, setAuthToken } from '../services/api';
import type { Place } from '../types';
import { fetchBusynessLevel } from '../services/useBusyness';
import type { BusynessLevel } from '../types';

/* ---------- Helpers ---------- */
const pad  = (n: number) => n.toString().padStart(2, '0');
const sortTimes = (a: string, b: string) => a.localeCompare(b);

const isBusynessLevel = (v: any): v is BusynessLevel =>
  ['low', 'med', 'high', 'unknown'].includes(v);

async function enrichWithBusyness(
  places: Place[],
): Promise<(Place & { busynessLevel: BusynessLevel })[]> {
  return Promise.all(
    places.map(async p => {
      const raw = await fetchBusynessLevel(p.lat, p.lng);
      const lvl = isBusynessLevel(raw) ? raw : 'unknown';
      return { ...p, busynessLevel: lvl };
    }),
  );
}

/** Default map centre (Manhattan). */
const DEFAULT_CENTRE: google.maps.LatLngLiteral = { lat: 40.7422, lng: -73.988 };

/* =================================================================== */
/* Main component                                                      */
/* =================================================================== */
export default function MyItinerary() {
  const { tripId } = useParams();

  /* ───── Trip header (hero) ───── */
  const [tripName, setTripName] = useState('Your Trip');
  const [tripDate, setTripDate] = useState('Date not set');

  /* ───── Load trip basics ───── */
  useEffect(() => {
    if (!tripId) return;
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
        setAuthToken(token);

        const trip = await fetchTripDetails(tripId);
        setTripName(trip.basicInfo.tripName);
        setTripDate(new Date(trip.basicInfo.startDateTime).toLocaleDateString());
      } catch (err) {
        console.error('Failed to fetch trip in MyItinerary:', err);
      }
    })();
  }, [tripId]);

  if (!tripId) return <div>Error: No trip selected.</div>;

  /* ───── Itinerary data ───── */
  const { entries, remove } = useItinerary(tripId);
  const [placesWithBusyness, setPlacesWithBusyness] = useState<
    (Place & { busynessLevel: BusynessLevel })[]
  >([]);

  useEffect(() => {
    enrichWithBusyness(entries.map(e => e.place)).then(setPlacesWithBusyness);
  }, [entries]);

  /* ───── Map / highlight state ───── */
  const [focusCoord, setFocusCoord] = useState<google.maps.LatLngLiteral | null>(null);
  const [mapZoom, setMapZoom]       = useState(13);
  const [highlightId, setHighlight] = useState<string | null>(null);
  const [infoPlace, setInfoPlace]   = useState<Place | null>(null);

  /* Close the popup if the place disappears from the list */
  useEffect(() => {
    if (infoPlace && !entries.some(e => e.place.id === infoPlace.id)) {
      setInfoPlace(null);
    }
  }, [entries, infoPlace]);

  /* ---------- Google-Maps directions URL ---------- */
  const buildMapsUrl = (): string | null => {
    if (!entries.length) return null;

    const ordered = [...entries].sort((a, b) => sortTimes(a.time, b.time));
    const coords  = ordered.map(e => `${e.place.lat},${e.place.lng}`).slice(0, 10); // GM limit

    if (coords.length === 1) {
      return `https://www.google.com/maps/search/?api=1&query=${coords[0]}`;
    }

    const [origin, ...rest] = coords;
    const destination = rest.pop() as string;
    const waypoints   = rest.join('|');

    return (
      `https://www.google.com/maps/dir/?api=1` +
      `&origin=${origin}` +
      `&destination=${destination}` +
      (waypoints ? `&waypoints=${encodeURIComponent(waypoints)}` : '') +
      `&travelmode=walking`
    );
  };

  /* ---------- Unique time slots ---------- */
  const timeSlots = [...new Set(entries.map(e => e.time).filter(Boolean))].sort(sortTimes);

  /* ------------------------------------------------------------------ */
  /* LEFT column – grouped place cards                                   */
  /* ------------------------------------------------------------------ */
  const left = (
    <div className="space-y-2 pr-1">
      {timeSlots.map(t => {
        const places = entries.filter(e => e.time === t).map(e => e.place);
        if (!places.length) return null;

        return (
          <section key={t}>
            {/* Time-slot heading */}
            <div className="mb-4 text-center">
              <h4 className="text-lg font-semibold text-[#012b42]">{t}</h4>
              <div className="mt-1 mx-auto w-1/2 border-b border-[#012b42]" />
            </div>

            {/* Cards */}
            <div className="space-y-4">
              {places.map(p => (
                <div
                  key={p.id}
                  onMouseEnter={() => setHighlight(p.id)}
                  onMouseLeave={() => setHighlight(null)}
                  onClick={() => {
                    setHighlight(p.id);
                    setFocusCoord({ lat: p.lat, lng: p.lng });
                    setMapZoom(15);
                    setInfoPlace(p);
                  }}
                >
                  <PlaceCard
                    place={p}
                    onAdd={() => {/* handled in PlaceCard pop-up */}}
                    onRemove={() => remove(p.id, t)}
                    saved
                    highlighted={highlightId === p.id}
                    hideItinerary
                    timeSlot={t}
                  />
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {/* Empty-state message */}
      {entries.length === 0 && (
        <p className="mt-6 text-center text-gray-500">
          You haven't added anything yet - use “+ My Itinerary” on the Explore page.
        </p>
      )}
    </div>
  );

  /* ------------------------------------------------------------------ */
  /* RIGHT column – map                                                 */
  /* ------------------------------------------------------------------ */
  const right = (
    <MapPane
      places={placesWithBusyness}
      focusCoord={focusCoord ?? DEFAULT_CENTRE}
      zoom={mapZoom}
      infoPlace={infoPlace}
      onInfoClose={() => setInfoPlace(null)}
      onMarkerClick={p => {
        setHighlight(p.id);
        setFocusCoord({ lat: p.lat, lng: p.lng });
        setMapZoom(15);
        setInfoPlace(p);
      }}
      onRemoveFromItinerary={place => {
        const entry = entries.find(e => e.place.id === place.id);
        if (entry) remove(place.id, entry.time);
        setInfoPlace(null);
      }}
    />
  );

  /* ------------------------------------------------------------------ */
  /* Render                                                             */
  /* ------------------------------------------------------------------ */
  return (
    <Layout
      activeTab="My Itinerary"
      tripId={tripId}
      tripName={tripName}
      tripDate={tripDate}
      left={left}
      right={right}
      heroCollapsed
    />
  );
}
