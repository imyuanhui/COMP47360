// src/pages/ExplorePlaces.tsx
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import SearchBar from '../components/SearchBar';
import MapPane from '../components/MapPane';
import { fetchPlaces } from '../services/api';
import type { Place } from '../types';

interface TripOption {
  name: string;
  startDate: string;
  endDate: string;
}

export default function ExplorePlaces() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<string[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Itinerary modal state
  const [showItinModal, setShowItinModal] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [tripOptions, setTripOptions] = useState<TripOption[]>([]);
  const [selectedTripIdx, setSelectedTripIdx] = useState<number | ''>('');

  // Saved‐places state
  const [savedPlaces, setSavedPlaces] = useState<Place[]>(() => {
    const s = localStorage.getItem('savedPlaces');
    return s ? JSON.parse(s) : [];
  });

  // Fetch search results
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchPlaces(query, filters)
      .then(data => { if (!cancelled) setPlaces(data); })
      .catch(console.error)
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [query, filters]);

  // Load your existing trips from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('myTrips');
    if (stored) {
      setTripOptions(JSON.parse(stored));
    }
  }, []);

  const toggleSave = (p: Place) => {
    let updated: Place[];
    if (savedPlaces.find(sp => sp.id === p.id)) {
      updated = savedPlaces.filter(sp => sp.id !== p.id);
    } else {
      updated = [...savedPlaces, p];
    }
    setSavedPlaces(updated);
    localStorage.setItem('savedPlaces', JSON.stringify(updated));
  };

  // Open the modal for both real and empty cards
  const openItin = (p: Place | null) => {
    console.log('Opening itinerary modal for', p);
    setSelectedPlace(p);
    setShowItinModal(true);
  };

  const handleAddToItin = () => {
    console.log('Adding to itinerary:', selectedPlace, 'trip index:', selectedTripIdx);
    if (selectedTripIdx === '' || !selectedPlace) return;
    const existing = JSON.parse(localStorage.getItem('itinerary') || '[]');
    existing.push({
      tripName: tripOptions[selectedTripIdx].name,
      place: selectedPlace,
      timeSlot: `${new Date(tripOptions[selectedTripIdx].startDate).toLocaleDateString()} → ${new Date(tripOptions[selectedTripIdx].endDate).toLocaleDateString()}`
    });
    localStorage.setItem('itinerary', JSON.stringify(existing));
    setShowItinModal(false);
    setSelectedTripIdx('');
    setSelectedPlace(null);
    alert('Added to itinerary!');
  };

  const left = (
    <>
      <div className="mb-4">
        <SearchBar onSearch={setQuery} onFilterChange={setFilters} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
        {(loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 animate-pulse rounded-lg" />
            ))
          : (places.length ? places.slice(0,4) : Array(4).fill(null))
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
              {/* ★ Star */}
              <div
                className="absolute top-2 left-2 cursor-pointer text-xl"
                onClick={() => toggleSave(p)}
              >
                {savedPlaces.find(sp => sp.id === p.id) ? '★' : '☆'}
              </div>

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

              {/* + Add to my itinerary */}
              <button
                onClick={() => openItin(p)}
                className="
                  absolute bottom-3 right-3
                  bg-[#03253D] text-white text-xs
                  px-3 py-1 rounded-full
                  hover:bg-[#021B2B] transition-colors
                "
              >
                + Add to my itinerary
              </button>
            </div>
          ) : (
            <div
              key={`empty-${idx}`}
              className="
                relative flex flex-col justify-center items-center
                bg-gray-50 border border-dashed border-gray-300
                h-48 rounded-lg
                transition-transform duration-300
                hover:-translate-y-1 hover:shadow-lg
              "
            >
              <p className="text-gray-400">No place defined</p>
              <button
                onClick={() => openItin(null)}
                className="mt-2 text-xs text-[#03253D] hover:underline"
              >
                + Add to my itinerary
              </button>
            </div>
          )
        )}
      </div>

      {/* Itinerary Modal */}
      {showItinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {selectedPlace
                ? `Add “${selectedPlace.name}” to…`
                : 'Add a new place to…'
              }
            </h2>
            <label className="block text-sm mb-1">Choose trip:</label>
            <select
              value={selectedTripIdx}
              onChange={e => setSelectedTripIdx(Number(e.target.value))}
              className="w-full border rounded px-3 py-2 mb-4"
            >
              <option value="" disabled>
                Select a trip
              </option>
              {tripOptions.map((t, i) => (
                <option key={i} value={i}>
                  {t.name} (
                  {new Date(t.startDate).toLocaleDateString()}–
                  {new Date(t.endDate).toLocaleDateString()})
                </option>
              ))}
            </select>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowItinModal(false)}
                className="px-4 py-2 rounded border"
              >
                Cancel
              </button>
              <button
                onClick={handleAddToItin}
                className="px-4 py-2 bg-[#03253D] text-white rounded"
                disabled={selectedTripIdx === ''}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  const right = (
    <div className="h-full">
      <MapPane
        places={places}
        onMarkerClick={id => setHighlightId(id)}
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
