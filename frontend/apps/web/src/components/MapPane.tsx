// src/components/MapPane.tsx
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import type { Place } from '../types';
import L from 'leaflet';

// Fix Leaflet's default icon paths:
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface Props {
  places: Place[];
  onMarkerClick: (id: string) => void;
}

export default function MapPane({ places, onMarkerClick }: Props) {
  // Center the map on the first place, or Manhattan by default:
  const center: [number, number] = places.length
    ? [places[0].lat, places[0].lng]
    : [40.7831, -73.9712];

  return (
    <MapContainer
      center={center}
      zoom={13}
      className="h-full w-full"
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {places.map(p => (
        <Marker
          key={p.id}
          position={[p.lat, p.lng]}
          eventHandlers={{ click: () => onMarkerClick(p.id) }}
        >
          <Popup>
            <div className="font-semibold">{p.name}</div>
            <div className="text-sm text-gray-600">{p.address}</div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
