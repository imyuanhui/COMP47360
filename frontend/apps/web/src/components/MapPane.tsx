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

import React, { useEffect, useRef } from 'react';
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useLoadScript,
} from '@react-google-maps/api';
import type { Place } from '../types';

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

  /* save ref so we can imperatively pan / zoom without re-mounting */
  const mapRef = useRef<google.maps.Map | null>(null);

  /* Decide where to aim the camera if parent hasn’t supplied focusCoord */
  const centre: google.maps.LatLngLiteral =
    focusCoord ?? (places[0] ? { lat: places[0].lat, lng: places[0].lng } : defaultCenter);

  /* ---- side-effects: pan + zoom when parent props change ---- */
  useEffect(() => {
    if (mapRef.current) mapRef.current.panTo(centre);
  }, [centre]);

  useEffect(() => {
    if (mapRef.current) mapRef.current.setZoom(zoom);
  }, [zoom]);

  /* ---- loading / error fallbacks ---- */
  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded)  return <div>Loading Maps…</div>;

  /* ---- render ---- */
  return (
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

      {/* info-window (shown only when infoPlace !== null) */}
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
    </GoogleMap>
  );
}
