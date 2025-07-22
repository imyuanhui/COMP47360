/**********************************************************************
 * MapPane.tsx  — v5
 * --------------------------------------------------------------------
 * Google-Maps wrapper for Explore Places, Saved Places & My Itinerary.
 *
 *     2025-07-22 — Time-picker change
 *     • “Add to My Itinerary” now shows a small form with an HTML
 *       <input type="time"> (step = 300 s → 5 min granularity).
 *     • Minutes must be a multiple of 5;  invalid input triggers an
 *       alert and nothing is added.
 *
 *********************************************************************/

import React, { useEffect, useRef, useState } from 'react';
import type { Place, BusynessLevel } from '../types';
import {
  GoogleMap,
  InfoWindow,
  Marker,
  useLoadScript,
} from '@react-google-maps/api';
import axios from 'axios';
import { cache } from '../services/useBusyness'; // 🆕 shared cache

/* ------------------------------------------------------------------ */
/* Map constants                                                       */
/* ------------------------------------------------------------------ */

const LIBRARIES = ['places'] as const;
const containerStyle = { width: '100%', height: '100%' } as const;
const defaultCentre = { lat: 40.758, lng: -73.9855 }; // Times Sq. fallback

/* ---------- Map Styling ---------- */
const mapStyles: google.maps.MapTypeStyle[] = [
  { featureType: 'road', elementType: 'labels', stylers: [{ visibility: 'on' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#a2daf2' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#eaeaea' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#dbf2e3' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#d3d3d3' }] },
];

/* ------------------------------------------------------------------ */
/* Marker icon factory                                                 */
/* ------------------------------------------------------------------ */
function markerIcon(level: string, size = 40): google.maps.Icon {
  /* -------------------------------------------------------------- */
  /* 🆕  Loading marker (grey outline, animated dots would be nice
   *     but SVG SMIL is disabled in Chrome; we go for “…” instead)
   * -------------------------------------------------------------- */
  if (level === 'loading') {
    const svg = `
    <svg width="${size}" height="${size + 6}" viewBox="0 0 40 46" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="14" fill="#ffffff" stroke="#022c44" stroke-width="1.5"/>
      <path d="M16 32 L24 32 L20 40 Z" fill="#ffffff"/>
      <line x1="16" y1="32" x2="20" y2="40" stroke="#022c44" stroke-width="1.5"/>
      <line x1="24" y1="32" x2="20" y2="40" stroke="#022c44" stroke-width="1.5"/>
      <text x="20" y="25" font-size="12" font-family="Arial" font-weight="bold"
            text-anchor="middle" fill="#022c44">…</text>
    </svg>`;

    return {
      url: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`,
      scaledSize: new google.maps.Size(size, size + 6),
      anchor: new google.maps.Point(size / 2, size + 6),
    };
  }

  /* ---------- existing coloured icons ---------- */
  const colour =
    level === 'low'
      ? '#6590f6'
      : level === 'med'
      ? '#f4b241'
      : level === 'high'
      ? '#cc397c'
      : '#9ca3af';

  const label =
    level === 'low' ? 'L' : level === 'med' ? 'M' : level === 'high' ? 'H' : 'U';

  const svg = `
    <svg width="${size}" height="${size + 6}" viewBox="0 0 40 46" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="14" fill="${colour}" stroke="#022c44" stroke-width="1.5"/>
      <path d="M16 32 L24 32 L20 40 Z" fill="${colour}"/>
      <line x1="16" y1="32" x2="20" y2="40" stroke="#022c44" stroke-width="1.5"/>
      <line x1="24" y1="32" x2="20" y2="40" stroke="#022c44" stroke-width="1.5"/>
      <text x="20" y="25" font-size="12" font-family="Arial" font-weight="bold"
            text-anchor="middle" fill="#022c44">${label}</text>
    </svg>
  `;

  return {
    url: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(size, size + 6),
    anchor: new google.maps.Point(size / 2, size + 6),
  };
}

/* ------------------------------------------------------------------ */
/* Time‐slot options for the "Add to My Itinerary" dropdown            */
/*  (retained for reference; no longer rendered)                       */
/* ------------------------------------------------------------------ */
const TIMES = Array.from({ length: 10 }, (_, i) => `${(9 + i).toString().padStart(2, '0')}:00`);

/* ---------- Button Styling ---------- */
const baseBtn = 'min-w-[11rem] h-7 px-2 py-1 text-xs rounded whitespace-nowrap transition-colors';
const ghostBtn = `${baseBtn} bg-gray-100 hover:bg-gray-200`;
const primaryBtn = `${baseBtn} bg-[#022c44] text-white hover:bg-[#022c44]/90`;
const removeBtn = `${baseBtn} bg-red-100 text-red-700 hover:bg-red-200`;

/* ------------------------------------------------------------------ */
/* Component props                                                     */
/* ------------------------------------------------------------------ */
interface Props {
  places: (Place & { busynessLevel: BusynessLevel })[];

  focusCoord: google.maps.LatLngLiteral | null;
  zoom: number;

  infoPlace: Place | null;
  onInfoClose: () => void;
  onMarkerClick: (p: Place) => void;

  /** Optional – only passed by Explore Places */
  saved?: Place[];
  onToggleSave?: (place: Place) => void;
  onAddToItinerary?: (place: Place, time: string) => void;
  onRemoveFromItinerary?: (place: Place) => void;
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
  onRemoveFromItinerary,
}: Props) {
  /* ---------------- Script loader ---------------- */
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: [...LIBRARIES],
  });

  /* ---------------- Local state ---------------- */
  const mapRef = useRef<google.maps.Map | null>(null);

  type WithBusyness = Place & { busynessLevel: BusynessLevel };
  const withLevels: WithBusyness[] = places;

  const [filter, setFilter] = useState({
    high: true,
    med: true,
    low: true,
  });
  const toggle = (lvl: keyof typeof filter) =>
    setFilter(prev => ({ ...prev, [lvl]: !prev[lvl] }));

  /* ---------- Dropdown / form state ---------- */
  const [openMenu, setOpenMenu] = useState(false);
  const [timeInput, setTimeInput] = useState('09:00');
  useEffect(() => setOpenMenu(false), [infoPlace]); // close when switching place / closing window
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpenMenu(false);
    if (openMenu) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [openMenu]);

  /* ---------------- Map centring / zoom ---------------- */
  const centre =
    focusCoord ?? (places[0] ? { lat: places[0].lat, lng: places[0].lng } : defaultCentre);

  useEffect(() => {
    if (mapRef.current) mapRef.current?.panTo(centre);
  }, [centre]);
  useEffect(() => {
    if (mapRef.current) mapRef.current?.setZoom(zoom);
  }, [zoom]);

  /* ---------------- Loading & error ---------------- */
  if (loadError) return <p>Error loading Google Maps.</p>;
  if (!isLoaded) return <p>Loading map…</p>;

  /* ---------------- Helper: validate time ---------------- */
  const isValidTime = (t: string) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(t) && parseInt(t.slice(3), 10) % 5 === 0;

  /* ---------------- JSX ---------------- */
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* --- filter widget --- */}
      <div className="absolute top-3 right-3 z-10 w-44 rounded border bg-white p-3 shadow">
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
                  ? 'text-customPink'
                  : lvl === 'med'
                  ? 'text-customAmber'
                  : 'text-customTeal'
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
        onLoad={m => {
          mapRef.current = m;
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
          .filter((p: WithBusyness) => {
            let lvl: keyof typeof filter;

            if (p.busynessLevel === 'low' || p.busynessLevel === 'med' || p.busynessLevel === 'high') {
              lvl = p.busynessLevel;
              return filter[lvl];
            }

            return false; // exclude 'unknown' and 'loading'
          })
          /* ------- UNIQUE KEY PER ENTRY (fixes duplicate-marker bug) ------- */
          .map((p, i) => (
            <Marker
              key={`${p.id}-${i}`} /* ← now guaranteed unique */
              position={{ lat: p.lat, lng: p.lng }}
              icon={markerIcon(p.busynessLevel)}
              onClick={() => onMarkerClick(p)}
            />
          ))}
      </GoogleMap>
    </div>
  );
}
