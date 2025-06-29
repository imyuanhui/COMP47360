// src/pages/SavedPlaces.tsx
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import PlaceList from '../components/PlaceList';
import MapPane from '../components/MapPane';
import { fetchSavedPlaces } from '../services/api';
import type { Place } from '../types';

export default function SavedPlaces() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  // Load saved places on mount
  useEffect(() => {
    fetchSaved().then(setPlaces);
  }, []);

  // LEFT pane: list of saved places
  const left = (
    <div className="space-y-4">
      {places.map((place) => (
        <div
          key={place.id}
          className={`
            relative flex items-center bg-white rounded-lg shadow p-4
            transition-transform transform hover:-translate-y-1 hover:shadow-lg
            ${highlightId === place.id ? 'ring-2 ring-blue-500' : ''}
          `}
        >
          {/* Thumbnail placeholder */}
          <div className="w-24 h-24 bg-gray-200 rounded mr-4 flex-shrink-0" />

          {/* Details */}
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{place.name}</h3>
            <p className="text-sm text-gray-600">{place.address}</p>
          </div>
        </div>
      ))}

      {places.length === 0 && (
        <p className="text-center text-gray-500 mt-8">
          You haven't saved any places yet.
        </p>
      )}
    </div>
  );

  // RIGHT pane: map with saved markers
  const right = (
    <MapPane
      places={places}
      onMarkerClick={setHighlightId}
    />
  );

  return (
    <Layout
      activeTab="Saved Places"
      left={left}
      right={right}
    />
  );
}
