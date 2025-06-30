// src/pages/MyItinerary.tsx
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ItineraryList from '../components/ItineraryList';
import MapPane from '../components/MapPane';
import { fetchItinerary, removeItinerary } from '../services/api';
import type { ItineraryItem } from '../types';

export default function MyItinerary() {
  const [items, setItems] = useState<ItineraryItem[]>([]);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  // Load itinerary on mount
  useEffect(() => {
    fetchItinerary().then(setItems);
  }, []);

  // Remove then re-fetch
  const handleRemove = async (id: string) => {
    await removeItinerary(id);
    const updated = await fetchItinerary();
    setItems(updated);
  };

  // LEFT pane: scrollable list of stops
  const left = (
    <div className="space-y-4">
      {items.map(item => (
        <div
          key={item.id}
          className={`
            relative flex items-center bg-white rounded-lg shadow p-4
            transition-transform transform hover:-translate-y-1 hover:shadow-lg
            ${highlightId === item.id ? 'ring-2 ring-blue-500' : ''}
          `}
        >
          {/* Thumbnail */}
          <div className="w-24 h-24 bg-gray-200 rounded mr-4 flex-shrink-0" />

          {/* Details */}
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{item.place.name}</h3>
            <p className="text-sm text-gray-600">{item.place.address}</p>
          </div>

          {/* Remove button */}
          <button
            onClick={() => handleRemove(item.id)}
            className="ml-4 text-red-500 hover:text-red-700"
          >
            Remove
          </button>
        </div>
      ))}

      {items.length === 0 && (
        <p className="text-center text-gray-500 mt-8">
          Your itinerary is empty. Start exploring to add places!
        </p>
      )}
    </div>
  );

  // RIGHT pane: map with all itinerary markers
  const right = (
    <MapPane
      places={items.map(i => i.place)}
      onMarkerClick={setHighlightId}
    />
  );

  return (
    <Layout
      activeTab="My Itinerary"
      left={left}
      right={right}
    />
  );
}
