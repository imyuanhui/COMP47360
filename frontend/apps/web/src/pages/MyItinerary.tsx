/***********************************************************************
 * MyItinerary.tsx
 * --------------------------------------------------------------------
 * Chronological list of the user’s itinerary with map synchronisation.
 ***********************************************************************/

import React, { useState } from 'react';
import Layout     from '../components/Layout';
import PlaceCard  from '../components/PlaceCard';
import MapPane    from '../components/MapPane';
import { useItinerary } from '../services/useItinerary';
import type { Place } from '../types';

/* ordered list of slots so ‘localeCompare’ isn’t needed later */
const SLOTS = Array.from({ length: 10 }, (_, i) =>
  `${(9 + i).toString().padStart(2, '0')}:00`,
);

const DEFAULT_CENTRE: google.maps.LatLngLiteral = { lat: 40.7831, lng: -73.9712 };

export default function MyItinerary() {
  /* itinerary state */
  const { entries, remove } = useItinerary();

  /* map + highlight (same pattern as other pages) */
  const [focusCoord, setFocusCoord] = useState<google.maps.LatLngLiteral | null>(null);
  const [mapZoom,    setMapZoom]    = useState(13);
  const [highlightId,setHighlight]  = useState<string | null>(null);
  const [infoPlace,  setInfoPlace]  = useState<Place | null>(null);

  /* ---------------- LEFT PANE ---------------- */
  const left = (
    <div className="space-y-6 pr-1">
      {SLOTS.map(slot => {
        const places = entries
          .filter(e => e.time === slot)
          .map(e => e.place);

        if (places.length === 0) return null;

        return (
          <section key={slot}>
            <div className="mb-4 text-center">
              <h4 className="text-lg font-semibold text-[#012b42]">{slot}</h4>
              <div className="mt-1 mx-auto w-1/2 border-b border-[#012b42]" />
            </div>

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
                    onAdd={() => {}}
                    saved
                    highlighted={highlightId === p.id}
                    hideItinerary={true}
                    timeSlot={slot}          // ⬅️ supplies the hour ⇒ correct text
                  />

                  {/* tiny remove link */}
                  <button
                    onClick={() => remove(p.id, slot)}
                    className="ml-2 text-xs text-red-600 hover:underline"
                  >
                    remove
                  </button>
                </div>
              ))}
            </div>
          </section>
        );
      })}
      {entries.length === 0 && (
        <p className="mt-6 text-center text-gray-500">
          You haven't added anything yet - use “+ My Itinerary” on the Explore page.
        </p>
      )}
    </div>
  );

  /* ---------------- RIGHT PANE ---------------- */
  const right = (
    <MapPane
      places={entries.map(e => e.place)}
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
    />
  );

  return <Layout activeTab="My Itinerary" left={left} right={right} />;
}
