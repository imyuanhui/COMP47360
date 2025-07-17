/**********************************************************************
 * MapPane.tsx  — v3
 * --------------------------------------------------------------------
 * Google-Maps wrapper for Explore Places, Saved Places & My Itinerary.
 * All markers are coloured by predicted busyness.  The predictions
 * come from a single shared in-memory cache so no place is fetched
 * more than once per browser tab.  “unknown” levels are never cached.
 *********************************************************************/

import React, { useEffect, useRef, useState } from 'react';
import {
  GoogleMap,
  InfoWindow,
  Marker,
  useLoadScript,
} from '@react-google-maps/api';
import axios from 'axios';
import type { Place } from '../types';
import { cache } from '../services/useBusyness';     // 🆕 shared cache

/* ------------------------------------------------------------------ */
/* Map constants                                                       */
/* ------------------------------------------------------------------ */

const LIBRARIES = ['places'] as const;
const containerStyle = { width: '100%', height: '100%' } as const;
const defaultCentre  = { lat: 40.758, lng: -73.9855 };            // Times Sq. fallback

/* ---------- Map Styling ---------- */
const mapStyles: google.maps.MapTypeStyle[] = [
  { featureType: 'road',      elementType: 'labels',   stylers: [{ visibility: 'on' }] },
  { featureType: 'water',     elementType: 'geometry', stylers: [{ color: '#a2daf2' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
  { featureType: 'road',      elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'poi',       elementType: 'geometry', stylers: [{ color: '#e0f2e9' }] },
  { featureType: 'poi',       elementType: 'labels',   stylers: [{ visibility: 'off' }] },
  { featureType: 'transit',   elementType: 'geometry', stylers: [{ color: '#d3d3d3' }] },
];

/* ------------------------------------------------------------------ */
/* Marker icon factory                                                 */
/* ------------------------------------------------------------------ */
function markerIcon(level: string, size = 40): google.maps.Icon {
  const colour =
    level === 'low'  ? '#34d399' :
    level === 'med'  ? '#f59e0b' :
    level === 'high' ? '#ef4444' : '#9ca3af';

  const label  =
    level === 'low'  ? 'L' :
    level === 'med'  ? 'M' :
    level === 'high' ? 'H' : 'U';

  const svg = `
    <svg width="${size}" height="${size + 6}" viewBox="0 0 40 46" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="16" fill="${colour}" stroke="#ffffff" stroke-width="2"/>
      <path d="M16 32 L24 32 L20 38 Z" fill="${colour}"/>
      <text x="20" y="25" font-size="14" font-family="Arial" font-weight="bold"
            text-anchor="middle" fill="#ffffff">${label}</text>
    </svg>
  `;

  return {
    url: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`,
    scaledSize:      new google.maps.Size(size, size + 6),
    anchor:          new google.maps.Point(size / 2, size + 6),
  };
}

/* ------------------------------------------------------------------ */
/* Time-slot options for the "Add to My Itinerary" dropdown            */
/* ------------------------------------------------------------------ */
const TIMES = Array.from({ length: 10 }, (_, i) => `${(9 + i).toString().padStart(2, '0')}:00`);

/* ---------- Button Styling ---------- */
const baseBtn  = 'min-w-[11rem] h-7 px-2 py-1 text-xs rounded whitespace-nowrap transition-colors';
const ghostBtn = `${baseBtn} bg-gray-100 hover:bg-gray-200`;
const primaryBtn = `${baseBtn} bg-[#022c44] text-white hover:bg-[#022c44]/90`;
const removeBtn  = `${baseBtn} bg-red-100 text-red-700 hover:bg-red-200`;

/* ------------------------------------------------------------------ */
/* Component props                                                     */
/* ------------------------------------------------------------------ */
interface Props {
  places: Place[];
  focusCoord: google.maps.LatLngLiteral | null;
  zoom: number;

  infoPlace: Place | null;
  onInfoClose: () => void;
  onMarkerClick: (p: Place) => void;

  /** Optional – only passed by Explore Places */
  saved?: Place[];
  onToggleSave?: (place: Place) => void;
  onAddToItinerary?: (place: Place, time: string) => void;
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */
export default function MapPane({
  places,
  focusCoord,
  zoom,
  infoPlace,
  onInfoClose,
  onMarkerClick,
  saved = [],
  onToggleSave,
  onAddToItinerary,
}: Props) {
  /* ---------------- Script loader ---------------- */
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: [...LIBRARIES],
  });

  /* ---------------- Local state ---------------- */
  const mapRef = useRef<google.maps.Map | null>(null);

  type WithBusyness = Place & { busynessLevel: string };
  const [withLevels, setWithLevels] = useState<WithBusyness[]>([]);

  const [filter, setFilter] = useState({
    high: true,
    med: true,
    low: true,
    unknown: true,
  });
  const toggle = (lvl: keyof typeof filter) =>
    setFilter(prev => ({ ...prev, [lvl]: !prev[lvl] }));

  /* ---------- Dropdown menu state for itinerary times ---------- */
  const [openMenu, setOpenMenu] = useState(false);
  useEffect(() => setOpenMenu(false), [infoPlace]);          // close when switching place / closing window
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpenMenu(false);
    if (openMenu) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [openMenu]);

  /* ---------------- Fetch predictions (cached) ---------------- */
  useEffect(() => {
    if (!places.length) { setWithLevels([]); return; }

    const fetchAll = async () => {
      const rows = await Promise.all(
        places.map(async p => {
          const key = `${p.lat},${p.lng}`;
          if (cache.has(key))
            return { ...p, busynessLevel: cache.get(key)! };

          try {
            const { data } = await axios.get(
              `/api/busyness?lat=${p.lat}&lon=${p.lng}`,
            );
            const level = Array.isArray(data) ? data[0]?.busynessLevel : data.busynessLevel;
            const val   = level ?? 'unknown';

            if (val !== 'unknown') cache.set(key, val);
            return { ...p, busynessLevel: val };
          } catch {
            return { ...p, busynessLevel: 'unknown' };
          }
        }),
      );

      setWithLevels(rows);
    };

    fetchAll();
  }, [places]);

  /* ---------------- Map centring / zoom ---------------- */
  const centre =
    focusCoord ??
    (places[0] ? { lat: places[0].lat, lng: places[0].lng } : defaultCentre);

  useEffect(() => { if (mapRef.current) mapRef.current?.panTo(centre); }, [centre]);
  useEffect(() => { if (mapRef.current) mapRef.current?.setZoom(zoom);  }, [zoom]);

  /* ---------------- Loading & error ---------------- */
  if (loadError) return <p>Error loading Google Maps.</p>;
  if (!isLoaded) return <p>Loading map…</p>;

  /* ---------------- JSX ---------------- */
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* --- filter widget --- */}
      <div 
        className="absolute top-3 right-3 z-10 w-44 rounded border bg-white p-3 shadow"
        // style={{ borderColor: '#022c44'}}
        >
        <p className="mb-1 text-xs font-semibold leading-none">Show markers</p>
        {(['high', 'med', 'low'] as const).map(lvl => (
          <label key={lvl} className="mb-1 flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={filter[lvl]}
              onChange={() => toggle(lvl)}
              className="h-4 w-4 rounded custom-blue"
            />
            <span
                className={`capitalize font-semibold ${
                  lvl === 'high'
                    ? 'text-red-600'
                    : lvl === 'med'
                    ? 'text-orange-500'
                    : 'text-green-600'
                }`}
              >
              {lvl}
            </span>
          </label>
        ))}
      </div>

      {/* --- map --- */}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={centre}
        zoom={zoom}
        onLoad={m => {                              // braces create a block
            mapRef.current = m;                     // ← perform the assignment
        }}
        options={{
          styles: mapStyles,
          clickableIcons: false,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          zoomControl: true,
        }}
      >
        {/* --- markers --- */}
        {withLevels
          .filter(p => filter[p.busynessLevel as keyof typeof filter])
          .map(p => (
            <Marker
              key={p.id}
              position={{ lat: p.lat, lng: p.lng }}
              icon={markerIcon(p.busynessLevel)}
              onClick={() => onMarkerClick(p)}
            />
          ))}

        {/* --- InfoWindow that displays when clicking place in Explore Places--- */}
        {infoPlace && (
          <InfoWindow
            position={{ lat: infoPlace.lat, lng: infoPlace.lng }}
            onCloseClick={onInfoClose}
          >
            <div className="-mt-9 min-w-[12rem] max-w-[14rem] pr-3 space-y-2 pb-4"> {/* ---Settings for info window--- */}
              <h3 className="mb-1 font-semibold">{infoPlace.name}</h3> {/* ---Place name--- */}
              <p className="mt-1 mb-3 text-xs">{infoPlace.address}</p> {/* ---Address--- */}
              <p className="text-xs text-gray-600"> {/* ---Busyness rating--- */}
                  {(() => {
                  const level = withLevels.find(p => p.id === infoPlace.id)?.busynessLevel;
                  let levelClass = '';
                  if (level === 'low') levelClass = 'text-green-600 font-bold';
                  else if (level === 'med') levelClass = 'text-orange-500 font-bold';
                  else if (level === 'high') levelClass = 'text-red-600 font-bold';

                  return (
                    <p className="text-xs text-gray-600">
                      Busyness:{' '}
                      <span className={levelClass}>
                        {level ?? '…'}
                      </span>
                    </p>
                  );
                })()}
              </p>

              {/* ---------------- Action buttons (Explore Places only) ---------------- */}
              {onToggleSave && (
                <button
                  onClick={() => onToggleSave(infoPlace)}
                  className={
                    saved.some(p => p.id === infoPlace.id) ? removeBtn : primaryBtn
                  }
                >
                  {saved.some(p => p.id === infoPlace.id)
                    ? 'Remove from Saved Places'
                    : 'Add to Saved Places'}
                </button>
              )}

              {onAddToItinerary && (
                <div className="relative mt-2">
                  <button onClick={() => setOpenMenu(!openMenu)} className={ghostBtn}>
                    Add to My Itinerary
                  </button>

                  {openMenu && (
                    <div className="absolute right-0 top-10 z-10 w-44 rounded-lg border bg-white p-2 shadow-lg">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-sm font-semibold leading-none">Add to your Trip</p>
                        <button
                          onClick={() => setOpenMenu(false)}
                          className="text-sm text-gray-400 hover:text-gray-600"
                          aria-label="Close"
                        >
                          x
                        </button>
                      </div>

                      {TIMES.map(t => (
                        <button
                          key={t}
                          onClick={() => {
                            onAddToItinerary(infoPlace, t);
                            setOpenMenu(false);
                          }}
                          className="w-full rounded px-2 py-1 text-left text-xs hover:bg-gray-100"
                        >
                          {t} &nbsp; + Add to timeslot
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
