/**********************************************************************
 * MapPane.tsx
 * --------------------------------------------------------------------
 * Google-Map wrapper with markers, optional busyness circles,
 * and an InfoWindow.  Clicking the “Display Busyness” toggle will
 * always (a) centre on `defaultCenter` and (b) restore the *initial*
 * zoom level that was present on first load.
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
          {showZones ? 'Hide Business' : 'Display Business'}
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
            onClick={() => onMarkerClick(p)}
          />
        ))}

        {/* info-window */}
        {infoPlace && (
          <InfoWindow
            position={{ lat: infoPlace.lat, lng: infoPlace.lng }}
            onCloseClick={onInfoClose}
          >
            <div>
              <div className="font-semibold">{infoPlace.name}</div>
              <div className="text-sm text-gray-600">{infoPlace.address}</div>
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
