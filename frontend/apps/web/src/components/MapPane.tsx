/**********************************************************************
 * MapPane.tsx
 * --------------------------------------------------------------------
 * Re-usable Google-Map wrapper.
 *
 *  • Receives a list of <Place> objects and renders a marker for each.
 *  • `focusCoord`   – camera pans here whenever the prop changes
 *  • `zoom`         – fully controlled zoom level from parent
 *  • `infoPlace`    – if non-null, shows a single InfoWindow
 *  • `onMarkerClick` passes the clicked <Place> back to the parent
 *  • Tailwind-free: styling is handled by Google Maps options + the
 *    parent container’s size.
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

/* ---------- public props ---------- */
interface Props {
  places: Place[];                               // markers
  focusCoord: google.maps.LatLngLiteral | null;  // camera centre
  zoom: number;                                  // controlled zoom
  infoPlace: Place | null;                       // place to pop-up
  onInfoClose: () => void;                       // user closed bubble
  onMarkerClick: (p: Place) => void;             // bubble open / list sync
}

/* ---------- static map styling ---------- */
const mapStyles: google.maps.MapTypeStyle[] = [
  { featureType: 'road',      elementType: 'labels',    stylers: [{ visibility: 'on' }] },
  { featureType: 'water',     elementType: 'geometry',  stylers: [{ color: '#a2daf2' }] },
  { featureType: 'landscape', elementType: 'geometry',  stylers: [{ color: '#f5f5f5' }] },
  { featureType: 'road',      elementType: 'geometry',  stylers: [{ color: '#ffffff' }] },
  { featureType: 'poi',       elementType: 'geometry',  stylers: [{ color: '#e0f2e9' }] },
  { featureType: 'transit',   elementType: 'geometry',  stylers: [{ color: '#d3d3d3' }] },
];

const containerStyle = { width: '100%', height: '100%' } as const;
const defaultCenter: google.maps.LatLngLiteral = { lat: 40.7831, lng: -73.9712 };
const LIBRARIES = ['places'] as const;           // keep ref stable to silence warning

export default function MapPane({
  places,
  focusCoord,
  zoom,
  infoPlace,
  onInfoClose,
  onMarkerClick,
}: Props) {
  /* 1️⃣  Load Google Maps JS SDK (API key in .env) */
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: [...LIBRARIES],
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const [showZones, setShowZones] = useState(false);
  const zones = useZoneBusyness(showZones);

  const centre: google.maps.LatLngLiteral =
    focusCoord ?? (places[0] ? { lat: places[0].lat, lng: places[0].lng } : defaultCenter);

  useEffect(() => {
    if (mapRef.current) mapRef.current.panTo(centre);
  }, [centre]);

  useEffect(() => {
    if (mapRef.current) mapRef.current.setZoom(zoom);
  }, [zoom]);

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded)  return <div>Loading Maps…</div>;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Floating busyness toggle */}
      <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 10 }}>
        <button
          onClick={() => setShowZones(prev => !prev)}
          className="bg-[#032c46] text-white rounded px-3 py-1 shadow hover:bg-[#054067] transition"
        >
          {showZones ? 'Hide Busyness' : 'Display Busyness'}
        </button>
      </div>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={centre}
        zoom={zoom}
        onLoad={map => { mapRef.current = map; }}
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

        {/* zone circles */}
        {zones.map(z => (
          <Circle
            key={z.id}
            center={{ lat: z.lat, lng: z.lng }}
            radius={2000}
            options={{
              strokeWeight: 0,
              fillOpacity: 0.25,
              fillColor:
                z.rating === 'high' ? '#d9534f' :
                z.rating === 'medium' ? '#f0ad4e' : '#5cb85c',
            }}
          />
        ))}
      </GoogleMap>
    </div>
  );
}
