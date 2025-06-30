/***********************************************************************
 * SearchBar.tsx
 * ---------------------------------------------------------------------
 * Pure Google-Places Autocomplete input.  
 * (All filtering logic now lives in ExplorePlaces’ “+ Filter” modal.)
 *
 * Emits two callbacks:
 *   • onSearch(q)      → user hit Enter *or* chose a suggestion
 *   • onPlaceSelect(p) → full PlaceResult for map zoom / marker
 ***********************************************************************/

import React, { useRef, useState } from 'react';
import { Autocomplete, useLoadScript } from '@react-google-maps/api';

/* ----------------------------- props ----------------------------- */
interface Props {
  onSearch:      (query: string)                        => void;
  onPlaceSelect: (place: google.maps.places.PlaceResult)=> void;
}

export default function SearchBar({ onSearch, onPlaceSelect }: Props) {
  /* controlled input value */
  const [query, setQuery] = useState('');

  /* ref to read the selected PlaceResult */
  const acRef = useRef<google.maps.places.Autocomplete | null>(null);

  /* load Google Maps JS SDK with Places library */
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });

  /* when user picks a prediction from the dropdown */
  const handlePlaceChanged = () => {
    const place = acRef.current?.getPlace();
    if (!place) return;

    /* 1️⃣ Reflect chosen name/address in the textbox + trigger search */
    if (place.name) {
      setQuery(place.name);
      onSearch(place.name);
    } else if (place.formatted_address) {
      setQuery(place.formatted_address);
      onSearch(place.formatted_address);
    }

    /* 2️⃣ Pass full PlaceResult upward (map pane needs lat/lng) */
    onPlaceSelect(place);
  };

  /* ---------------- render ---------------- */
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
            placeholder="Search for a place or attraction"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onSearch(query)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2
                       focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </Autocomplete>
      ) : (
        <input
          disabled
          className="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-2"
          placeholder="Loading Google…"
        />
      )}
    </div>
  );
}
