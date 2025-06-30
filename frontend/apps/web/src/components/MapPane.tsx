// src/components/MapPane.tsx
import React, { useEffect, useRef } from 'react';
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useLoadScript,
} from '@react-google-maps/api';
import type { Place } from '../types';

interface Props {
  places: Place[];
  focusCoord: google.maps.LatLngLiteral | null;
  /** 🔸 Now sends back the whole Place object, not just the id */
  onMarkerClick: (place: Place) => void;
}

/* --- styling & constants (unchanged) --- */
const mapStyles = [
  { featureType: 'road', elementType: 'labels', stylers: [{ visibility: 'on' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#a2daf2' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#e0f2e9' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#d3d3d3' }] },
];

const containerStyle = { width: '100%', height: '100%' };
const defaultCenter = { lat: 40.7831, lng: -73.9712 };

export default function MapPane({ places, focusCoord, onMarkerClick }: Props) {
  /* 1️⃣  Load Google Maps JS SDK */
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });

  const mapRef = useRef<google.maps.Map | null>(null);

  const center: google.maps.LatLngLiteral =
    focusCoord ??
    (places.length
      ? { lat: places[0].lat, lng: places[0].lng }
      : defaultCenter);

  /* Pan whenever centre changes */
  useEffect(() => {
    if (mapRef.current) mapRef.current.panTo(center);
  }, [center]);

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps…</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={13}
      onLoad={(map): void => {
        mapRef.current = map;
      }}
      options={{
        styles: mapStyles,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      }}
    >
      {places.map(p => (
        <Marker
          key={p.id}
          position={{ lat: p.lat, lng: p.lng }}
          onClick={() => onMarkerClick(p)}  
        >
          <InfoWindow>
            <div>
              <div className="font-semibold">{p.name}</div>
              <div className="text-sm text-gray-600">{p.address}</div>
            </div>
          </InfoWindow>
        </Marker>
      ))}
    </GoogleMap>
  );
}
