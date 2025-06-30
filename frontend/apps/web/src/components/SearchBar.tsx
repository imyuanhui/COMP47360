import React, { useRef, useState } from 'react';
import { Autocomplete, useLoadScript } from '@react-google-maps/api';

interface Props {
  onSearch: (q: string) => void;
  onFilterChange: (filters: string[]) => void;
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
}

const FILTER_OPTIONS = ['Restaurant', 'Museum', 'Popular', 'Hidden Gem'];

export default function SearchBar({
  onSearch,
  onFilterChange,
  onPlaceSelect,
}: Props) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const acRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });

  const handlePlaceChanged = () => {
    const place = acRef.current?.getPlace();
    if (!place) return;

    /* 1️⃣  Prefer the NAME for the visible input text */
    if (place.name) {
      setQuery(place.name);
      onSearch(place.name);                    // you may keep address here if you rely on it
    } else if (place.formatted_address) {
      setQuery(place.formatted_address);
      onSearch(place.formatted_address);
    }

    /* 2️⃣  Bubble the raw PlaceResult up */
    onPlaceSelect(place);
  };

  const toggleFilter = (name: string, checked: boolean) => {
    const next = checked ? [...filters, name] : filters.filter(f => f !== name);
    setFilters(next);
    onFilterChange(next);
  };

  if (loadError) return <div>❌ Failed to load Google Maps</div>;

  return (
    <div className="mb-4">
      {isLoaded ? (
        <Autocomplete
          onLoad={ac => (acRef.current = ac)}
          onPlaceChanged={handlePlaceChanged}
        >
          <input
            type="text"
            placeholder="Enter a place or thing to search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onSearch(query)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </Autocomplete>
      ) : (
        <input
          disabled
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
          placeholder="Loading Google…"
        />
      )}

      <button
        onClick={() => setShowFilters(!showFilters)}
        className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        + Filters
      </button>

      {showFilters && (
        <div className="mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-md">
          <p className="font-semibold mb-2">Filter Your Search</p>
          <ul className="space-y-1 text-sm text-gray-700">
            {FILTER_OPTIONS.map(opt => (
              <li key={opt} className="flex items-center">
                <input
                  type="checkbox"
                  id={opt}
                  checked={filters.includes(opt)}
                  className="mr-2"
                  onChange={e => toggleFilter(opt, e.currentTarget.checked)}
                />
                <label htmlFor={opt}>{opt}</label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
