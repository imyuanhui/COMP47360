/**********************************************************************
 * MapPane.tsx
 * --------------------------------------------------------------------
 * Google‑Map wrapper with markers, optional busyness circles,
 * and an InfoWindow with Save / Itinerary actions.
 *********************************************************************/

import React, { useEffect, useRef, useState } from 'react';
import {
  GoogleMap,
  Marker,
  InfoWindow,
  Circle,
  useLoadScript,
} from '@react-google-maps/api';
import type { Place } from '../types';
import { useZoneBusyness } from '../services/useZoneBusyness';

/* ---------- incoming props ---------- */
interface Props {
  places: Place[];
  focusCoord: google.maps.LatLngLiteral | null;
  zoom: number;                                 // controlled by parent
  infoPlace: Place | null;
  onInfoClose: () => void;
  onMarkerClick: (p: Place) => void;

  /* NEW: save / itinerary */
  saved: Place[];
  onToggleSave: (place: Place) => void;
  onAddToItinerary: (place: Place, time: string) => void;
}

/* ---------- static styling & constants ---------- */
const mapStyles: google.maps.MapTypeStyle[] = [
  { featureType: 'road',      elementType: 'labels',    stylers: [{ visibility: 'on' }] },
  { featureType: 'water',     elementType: 'geometry',  stylers: [{ color: '#a2daf2' }] },
  { featureType: 'landscape', elementType: 'geometry',  stylers: [{ color: '#f5f5f5' }] },
  { featureType: 'road',      elementType: 'geometry',  stylers: [{ color: '#ffffff' }] },
  { featureType: 'poi',       elementType: 'geometry',  stylers: [{ color: '#e0f2e9' }] },
  { featureType: 'transit',   elementType: 'geometry',  stylers: [{ color: '#d3d3d3' }] },
];

/* Re‑use the button styles from PlaceCard */
const TIMES   = Array.from({ length: 10 }, (_, i) => `${(9 + i).toString().padStart(2, '0')}:00`);
const baseBtn = 'min-w-[10rem] h-7 px-2 py-1 text-xs rounded whitespace-nowrap transition-colors';
const ghostBtn = `${baseBtn} bg-gray-100 hover:bg-gray-200`;

const containerStyle = { width: '100%', height: '100%' } as const;
const defaultCenter: google.maps.LatLngLiteral = { lat: 40.7422, lng: -73.9880 };
const LIBRARIES = ['places'] as const;   // keep ref stable to silence warning

export default function MapPane({
  places,
  focusCoord,
  zoom,
  infoPlace,
  onInfoClose,
  onMarkerClick,
  saved,
  onToggleSave,
  onAddToItinerary,
}: Props) {
  /* 1️⃣  Load Google Maps JS SDK */
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: [...LIBRARIES],
  });

  /* ─── refs & local state ─── */
  const mapRef           = useRef<google.maps.Map | null>(null);
  const initialZoomRef   = useRef<number | null>(null);       // ⭐ remembers first zoom
  const [showZones, setShowZones] = useState(false);
  const [openMenu, setOpenMenu]   = useState(false);          // dropdown in the InfoWindow
  const zones = useZoneBusyness(showZones);

  /* ─── derived camera centre ─── */
  const centre: google.maps.LatLngLiteral =
    focusCoord ?? (places[0] ? { lat: places[0].lat, lng: places[0].lng } : defaultCenter);

  /* ─── sync map camera with props ─── */
  useEffect(() => {
    if (mapRef.current) mapRef.current.panTo(centre);
  }, [centre]);

  useEffect(() => {
    if (mapRef.current) mapRef.current.setZoom(zoom);
  }, [zoom]);

  /* ─── handle busyness toggle ─── */
  const toggleBusyness = () => {
    setShowZones(prev => !prev);

    if (mapRef.current) {
      // a) jump back to the canonical centre
      mapRef.current.panTo(defaultCenter);

      // b) restore FIRST-LOAD zoom level
      if (initialZoomRef.current !== null) {
        mapRef.current.setZoom(initialZoomRef.current);
      }
    }
  };

  /* ─── fallbacks ─── */
  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded)   return <div>Loading Maps…</div>;

  /* ─── render ─── */
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Floating busyness toggle */}
      <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 10 }}>
        <button
          onClick={toggleBusyness}
          className="bg-[#032c46] text-white rounded px-3 py-1 shadow hover:bg-[#054067] transition"
        >
          {showZones ? 'Hide Busyness' : 'Display Busyness'}
        </button>
      </div>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={centre}
        zoom={zoom}
        onLoad={map => {
          mapRef.current = map;

          /* Store the initial zoom exactly once */
          if (initialZoomRef.current === null) {
            initialZoomRef.current = map.getZoom() ?? zoom;
          }
        }}
        options={{
          styles:            mapStyles,
          clickableIcons:    false,
          zoomControl:       true,
          streetViewControl: false,
          mapTypeControl:    false,
          fullscreenControl: false,
        }}
      >
        {/* markers */}
        {places.map(p => (
          <Marker
            key={p.id}
            position={{ lat: p.lat, lng: p.lng }}
            onClick={() => {
              setOpenMenu(false);
              onMarkerClick(p);
            }}
          />
        ))}

        {/* info-window */}
        {infoPlace && (
          <InfoWindow
            position={{ lat: infoPlace.lat, lng: infoPlace.lng }}
            onCloseClick={() => {
              setOpenMenu(false);
              onInfoClose();
            }}
          >
            <div className="w-64">
              <div className="font-semibold">{infoPlace.name}</div>
              <div className="mb-2 text-sm text-gray-600">{infoPlace.address}</div>

              {/* ─── ACTION BUTTONS ─── */}
              <div className="flex flex-col items-start space-y-1.5">
                {/* Save / Remove */}
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onToggleSave(infoPlace);
                  }}
                  className={
                    saved.some(p => p.id === infoPlace.id)
                      ? `${baseBtn} bg-red-100 text-red-700 hover:bg-red-200`
                      : `${baseBtn} bg-[#022c44] text-white hover:bg-[#022c44]/90`
                  }
                >
                  {saved.some(p => p.id === infoPlace.id)
                    ? 'Remove from Saved Places'
                    : 'Add to Saved Places'}
                </button>

                {/* Itinerary slot-picker */}
                <div className="relative pb-3">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setOpenMenu(prev => !prev);
                    }}
                    className={ghostBtn}
                  >
                    Add to My Itinerary
                  </button>

                  {openMenu && (
                <div className="absolute left-0 top-9 z-10 w-60  /* ⬅ wider */
                            rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-semibold leading-none">Add to your Trip</p>
                    <button onClick={() => setOpenMenu(false)}
                            className="text-sm text-gray-400 hover:text-gray-600"
                            aria-label="Close">
                      x
                    </button>
                  </div>

                  {/* NEW wrapper → 2 equal columns */}
                  <div className="grid grid-cols-2 gap-1">
                    {TIMES.map(t => (
                      <button
                        key={t}
                        onClick={e => {
                          e.stopPropagation();
                          onAddToItinerary(infoPlace, t);
                          setOpenMenu(false);
                        }}
                        className="w-full rounded px-2 py-1 text-left text-sm hover:bg-gray-100"
                      >
                        {t} &nbsp; + Add to timeslot
                      </button>
                    ))}
                  </div>
                </div>
              )}
                </div>
              </div>
            </div>
          </InfoWindow>
        )}

        {/* coloured busyness circles */}
        {zones.map(z => (
          <Circle
            key={z.id}
            center={{ lat: z.lat, lng: z.lng }}
            radius={1500}
            options={{
              strokeWeight: 0,
              fillOpacity: 0.25,
              fillColor:
                z.rating === 'high'   ? '#d9534f' :
                z.rating === 'medium' ? '#f0ad4e' : '#5cb85c',
            }}
          />
        ))}
      </GoogleMap>
    </div>
  );
}
