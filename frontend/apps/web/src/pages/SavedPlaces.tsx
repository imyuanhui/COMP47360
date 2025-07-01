/***********************************************************************
 * SavedPlaces.tsx
 * ---------------------------------------------------------------------
 * Page that lists the user’s saved attractions and shows them on a map.
 ***********************************************************************/

import React, { useState } from 'react';
import Layout    from '../components/Layout';
import PlaceCard from '../components/PlaceCard';
import MapPane   from '../components/MapPane';
import { useSavedPlaces } from '../services/useSavedPlaces';
import type { Place } from '../types';

/* default map centre: Manhattan */
const DEFAULT_CENTRE: google.maps.LatLngLiteral = { lat: 40.7831, lng: -73.9712 };

export default function SavedPlaces() {
  /* saved-places context hook */
  const { saved, removePlace } = useSavedPlaces();

  /* map + highlight state (mirrors ExplorePlaces) */
  const [focusCoord, setFocusCoord] = useState<google.maps.LatLngLiteral | null>(null);
  const [mapZoom,    setMapZoom]    = useState(13);
  const [highlightId,setHighlight]  = useState<string | null>(null);
  const [infoPlace,  setInfoPlace]  = useState<Place | null>(null);

  /* ---------------- LEFT: list of saved cards ---------------- */
  const left = (
    <div className="space-y-4 pr-1">
      {saved.length === 0 ? (
        <p className="mt-6 text-center text-gray-500">No places saved yet.</p>
      ) : (
        saved.map(p => (
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
              saved={true}
              onAdd={() => {}}
              /* ‘Remove’ link shown via card title click */
              highlighted={highlightId === p.id}
            />

            {/* tiny remove link */}
            <button
              onClick={() => removePlace(p.id)}
              className="ml-2 text-xs text-red-600 hover:underline"
            >
              remove
            </button>
          </div>
        ))
      )}
    </div>
  );

  /* ---------------- RIGHT: map ---------------- */
  const right = (
    <MapPane
      places={saved}
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

  /* ---------------- render ---------------- */
  return <Layout activeTab="Saved Places" left={left} right={right} />;
}
