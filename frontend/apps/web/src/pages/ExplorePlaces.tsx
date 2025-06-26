// src/pages/ExplorePlaces.tsx
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import SearchBar from '../components/SearchBar';
import MapPane from '../components/MapPane';
import { fetchPlaces } from '../services/api';
import type { Place } from '../types';

export default function ExplorePlaces() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<string[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let canceled = false;
    setLoading(true);
    fetchPlaces(query, filters)
      .then(data => { if (!canceled) setPlaces(data); })
      .catch(console.error)
      .finally(() => { if (!canceled) setLoading(false); });
    return () => { canceled = true; };
  }, [query, filters]);

  const left = (
    <>
      <div className="mb-4">
        <SearchBar onSearch={setQuery} onFilterChange={setFilters} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
        {(loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-48 bg-gray-200 animate-pulse rounded-lg"
              />
            ))
          : (places.length ? places.slice(0, 4) : Array(4).fill(null))
        ).map((p, idx) =>
          p ? (
            <div
              key={p.id}
              onMouseEnter={() => setHighlightId(p.id)}
              onMouseLeave={() => setHighlightId(null)}
              className={`
                relative bg-white rounded-lg border p-4
                transition-transform duration-300
                ${highlightId === p.id
                  ? 'transform -translate-y-2 shadow-2xl'
                  : 'hover:-translate-y-1 hover:shadow-lg'}
              `}
            >
              <div className="flex">
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="w-24 h-24 object-cover rounded-lg mr-4"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">{p.name}</h4>
                  <p className="text-sm text-gray-500">{p.address}</p>
                </div>
              </div>

              {/* floating button bottom-right */}
              <button
                onClick={() => {/* TODO: add to itinerary */}}
                className="
                  absolute bottom-3 right-3
                  bg-[#03253D] text-white text-xs font-medium
                  px-3 py-1 rounded-full
                  hover:bg-[#021B2B]
                  transition-colors
                "
              >
                + Add to my itinerary
              </button>
            </div>
          ) : (
            <div
              key={`empty-${idx}`}
              className={`
                relative flex flex-col justify-center items-center
                bg-gray-50 border border-dashed border-gray-300
                h-48 rounded-lg
                transition-transform duration-300
                hover:-translate-y-1 hover:shadow-lg
              `}
            >
              <p className="text-gray-400">No place defined</p>
              <button
                className="
                  mt-2 text-xs text-[#03253D]
                  hover:underline
                "
              >
                + Add to my itinerary
              </button>
            </div>
          )
        )}
      </div>
    </>
  );

  const right = (
    <div className="h-full">
      <MapPane
        places={places}
        onMarkerClick={(id) => setHighlightId(id)}
      />
    </div>
  );

  return (
    <Layout
      activeTab="Explore Places"
      left={left}
      right={right}
    />
  );
}
