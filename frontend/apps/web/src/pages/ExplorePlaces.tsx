import React, { useEffect, useState } from 'react';
import Layout     from '../components/Layout';
import SearchBar  from '../components/SearchBar';
import PlaceCard  from '../components/PlaceCard';
import PlaceDetails from '../components/PlaceDetails';
import MapPane    from '../components/MapPane';
import { fetchPlaces } from '../services/googlePlaces';
import type { Place }  from '../types';

const DEFAULT_CENTRE = { lat: 40.7831, lng: -73.9712 };   // Manhattan

export default function ExplorePlaces() {
  const [query, setQuery]   = useState('');
  const [filters, setFilters] = useState<string[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);

  const [highlightId, setHighlight] = useState<string | null>(null);
  const [focusCoord, setFocusCoord] =
    useState<google.maps.LatLngLiteral | null>(null);
  const [selectedPlace, setSelectedPlace] =
    useState<google.maps.places.PlaceResult | null>(null);

  /* ❶ FIRST LOAD – grab a big POI list, shuffle, take 10 */
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetchPlaces('', [])               // empty query → broad POI list
      .then(res => {
        if (cancelled) return;
        const shuffled = [...res].sort(() => Math.random() - 0.5);
        const firstTen = shuffled.slice(0, 10);
        setPlaces(firstTen);
        if (firstTen[0]) {
          setFocusCoord({ lat: firstTen[0].lat, lng: firstTen[0].lng });
        }
      })
      .catch(console.error)
      .finally(() => !cancelled && setLoading(false));

    return () => { cancelled = true; };
  }, []);   // ← run only once

  /* ❷ TEXT SEARCH + FILTERS (unchanged) */
  useEffect(() => {
    if (query.trim() === '') return;
    let cancelled = false;
    setLoading(true);

    fetchPlaces(query, filters)
      .then(res => {
        if (!cancelled) setPlaces(res.slice(0, 10));
      })
      .catch(console.error)
      .finally(() => !cancelled && setLoading(false));

    return () => { cancelled = true; };
  }, [query, filters]);

  /* ❸ Clear details when search bar is emptied */
  useEffect(() => {
    if (query.trim() === '') setSelectedPlace(null);
  }, [query]);

  /* ❹ Push chosen place to backend (unchanged) */
  useEffect(() => {
    if (!selectedPlace?.geometry?.location) return;
    const loc = selectedPlace.geometry.location;
    fetch('/api/places', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        placeId: selectedPlace.place_id,
        name:     selectedPlace.name,
        address:  selectedPlace.formatted_address,
        lat: loc.lat(),
        lng: loc.lng(),
      }),
    }).catch(console.error);
  }, [selectedPlace]);

  /* helper: lightweight Place → PlaceResult */
  const toPlaceResult = (p: Place): google.maps.places.PlaceResult => ({
    place_id: p.id,
    name: p.name,
    formatted_address: p.address,
    geometry: {
      location: {
        lat: () => p.lat,
        lng: () => p.lng,
      } as unknown as google.maps.LatLng,
    },
  } as google.maps.places.PlaceResult);

  /* ---------- UI – unchanged below this line ---------- */
  const left = (
    <>
      <SearchBar
        onSearch={setQuery}
        onFilterChange={setFilters}
        onPlaceSelect={place => {
          setSelectedPlace(place);
          if (place.geometry?.location) {
            setFocusCoord({
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            });
          }
        }}
      />

      {selectedPlace && <PlaceDetails place={selectedPlace} />}

      <div className="max-h-[calc(100vh-260px)] overflow-y-auto pr-1 space-y-4 scrollbar-thin scrollbar-thumb-rounded">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 rounded-lg bg-gray-100 animate-pulse" />
            ))
          : places.map(p => (
              <div
                key={p.id}
                onMouseEnter={() => setHighlight(p.id)}
                onMouseLeave={() => setHighlight(null)}
              >
                <PlaceCard
                  place={p}
                  onAdd={() => console.log('Add', p.name)}
                  highlighted={highlightId === p.id}
                />
              </div>
            ))}
      </div>
    </>
  );

  const right = (
    <MapPane
      places={places}
      focusCoord={focusCoord}
      onMarkerClick={p => {
        setFocusCoord({ lat: p.lat, lng: p.lng });
        setHighlight(p.id);
        setSelectedPlace(toPlaceResult(p));
      }}
    />
  );

  return <Layout activeTab="Explore Places" left={left} right={right} />;
}
