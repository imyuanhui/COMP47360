// src/components/MapPane.tsx
import React from 'react';
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useLoadScript,
} from '@react-google-maps/api';
import type { Place } from '../types';

interface Props {
  places: Place[];
  onMarkerClick: (id: string) => void;
}

// 1. Define your custom map styles at the top of the file:
const mapStyles = [
      {
      featureType: "all",
      elementType: "labels",
      stylers: [{ visibility: "off" }], // Turn off all labels
    },
  {
    featureType: "road",
    elementType: "labels",
    stylers: [{ visibility: "on" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#a2daf2" }],
  },
  {
    featureType: "landscape",
    elementType: "geometry",
    stylers: [{ color: "#f5f5f5" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#e0f2e9" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#d3d3d3" }],
  },
];

const containerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = { lat: 40.7831, lng: -73.9712 };

export default function MapPane({ places, onMarkerClick }: Props) {
  // 2. Load the Google Maps API:
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const center = places.length
    ? { lat: places[0].lat, lng: places[0].lng }
    : defaultCenter;

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    // 3. Pass the `mapStyles` via the `options` prop:
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={13}
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
          onClick={() => onMarkerClick(p.id)}
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
