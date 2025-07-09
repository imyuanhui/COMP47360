/****************************************************************************************
 * ExplorePlaces.tsx
 * ------------------------------------------------------------------
 * Combined view that:
 *   • Shows 10 *recommended* places (random or filtered)
 *   • Lets users run a text search; search hits are stacked *above* recommendations
 *   • Synchronises list ↔ map interactions
 *   • Offers a “+ Filter” modal with persistent check-boxes
 *****************************************************************************************/

import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Layout    from '../components/Layout';
import SearchBar from '../components/SearchBar';
import PlaceCard from '../components/PlaceCard';
import MapPane   from '../components/MapPane';

import type { Place } from '../types';
import { usePlacesSearch } from '../services/usePlacesSearch';
import { useItinerary }   from '../services/useItinerary';
import { fetchTripDetails, setAuthToken } from '../services/api';

/* ------------------------------------------------------------------ */
/* Constants */
/* ------------------------------------------------------------------ */

/** Rough midpoint of Manhattan (used as centre for Nearby/Text search). */
const DEFAULT_CENTRE: google.maps.LatLngLiteral = { lat: 40.7422, lng: -73.9880 };

/** Radius that fully covers the island of Manhattan (~21 km × 3 km). */
const MANHATTAN_RADIUS = 5_500;            // metres

const FILTER_OPTIONS = [
  { type: 'museum',        label: 'Museums'        },
  { type: 'park',          label: 'Parks'          },
  { type: 'art_gallery',   label: 'Art Galleries'  },
  { type: 'shopping_mall', label: 'Shopping Malls' },
  { type: 'library',       label: 'Libraries'      },
  { type: 'night_club',    label: 'Night-life'     },
] as const;
type FilterType = typeof FILTER_OPTIONS[number]['type'];

/* =========================================================================
 * Component
 * =========================================================================*/
export default function ExplorePlaces() {
  const { tripId } = useParams();

  /* ───── Trip header (hero) ───── */
  const [tripName, setTripName] = useState('Your Trip');
  const [tripDate, setTripDate] = useState('Date not set');

  /* ───── UI state ───── */
  const [query,   setQuery]   = useState('');
  const [loading, setLoading] = useState(false);
  

  /* ───── Filter-modal state ───── */
  const [filters,      setFilters]      = useState<FilterType[]>([]);
  const [showModal,    setShowModal]    = useState(false);
  const [draftFilters, setDraftFilters] = useState<FilterType[]>([]);

  /* ───── Data lists ───── */
  const [recommended,   setRecommended]   = useState<Place[]>([]);
  const [searchResults, setSearchResults] = useState<Place[]>([]);

  /* ───── Map / highlight ───── */
  const [focusCoord, setFocusCoord] = useState<google.maps.LatLngLiteral | null>(null);
  const [mapZoom,    setMapZoom]    = useState(13);
  const [highlightId,setHighlight]  = useState<string | null>(null);
  const [infoPlace,  setInfoPlace]  = useState<Place | null>(null);

  /* ───── Hooks ───── */
  const { isReady, fetchRandomPlaces, searchText, loadError } = usePlacesSearch();
  const { entries: itinerary, add: addToItinerary } = useItinerary(tripId!);

  /* ───── Local “Saved Places” list (synced to localStorage) ───── */
  const [saved, setSaved] = useState<Place[]>([]);

  /* ─── Banner state ─── */
  const [heroCollapsed, setHeroCollapsed] = useState(false);

  /* Toggle add/remove */
  const togglePlace = (place: Place) => {
    setSaved(prev =>
      prev.some(p => p.id === place.id)
        ? prev.filter(p => p.id !== place.id)
        : [...prev, place],
    );
  };

  /* Load saved list on mount */
  useEffect(() => {
    const key = `saved-${tripId}`;
    const stored = localStorage.getItem(key);
    if (stored) setSaved(JSON.parse(stored));
  }, [tripId]);

  /* Persist whenever list changes */
  useEffect(() => {
    localStorage.setItem(`saved-${tripId}`, JSON.stringify(saved));
  }, [saved, tripId]);

  /* ------------------------------------------------------------------
   * Helper: refresh 10 recommended places (randomised)
   * ------------------------------------------------------------------ */
  const refreshRecommended = useCallback(() => {
    if (!isReady) return;

    setLoading(true);

    const fetch = filters.length
      ? searchText('tourist attraction', DEFAULT_CENTRE, filters, MANHATTAN_RADIUS)
          .then(r => [...r].sort(() => Math.random() - 0.5).slice(0, 10))
      : fetchRandomPlaces(DEFAULT_CENTRE, MANHATTAN_RADIUS);

    fetch
      .then(r => {
        setRecommended(r);
        if (!searchResults.length && r[0]) {
          setFocusCoord({ lat: r[0].lat, lng: r[0].lng });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isReady, filters, fetchRandomPlaces, searchText, searchResults.length]);

  /* 1️⃣ initial load + whenever filters change */
  useEffect(refreshRecommended, [refreshRecommended]);

  /* 2️⃣ fetch trip details (name / date) */
  useEffect(() => {
    if (!tripId) return;

    (async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        setAuthToken(token);

        const trip = await fetchTripDetails(tripId);
        setTripName(trip.basicInfo.tripName);
        setTripDate(new Date(trip.basicInfo.startDateTime).toLocaleDateString());
      } catch (err) {
        console.error('Failed to fetch trip details:', err);
      }
    })();
  }, [tripId]);

  /* 3️⃣ live text search */
  useEffect(() => {
    if (!isReady) return;

    const q = query.trim();
    if (q === '') {
      setSearchResults([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    searchText(q, DEFAULT_CENTRE, filters, MANHATTAN_RADIUS)
      .then(r => {
        if (cancelled) return;
        const top = r.slice(0, 10);
        setSearchResults(top);

        if (top[0]) {
          setFocusCoord({ lat: top[0].lat, lng: top[0].lng });
          setMapZoom(15);
        }
      })
      .catch(console.error)
      .finally(() => !cancelled && setLoading(false));

    return () => { cancelled = true; };
  }, [isReady, query, filters, searchText]);

  /* Merge search + recommended and de-duplicate by id */
  const combined: Place[] = [
    ...searchResults,
    ...recommended.filter(r => !searchResults.some(s => s.id === r.id)),
  ];

  /* =========================================================================
   * LEFT column – SearchBar, “+ Filter”, PlaceCard list
   * =========================================================================*/
  
  const left = (
    /* Collapse hero banner on first hover */
    <div onMouseEnter={() => setHeroCollapsed(true)}>
      <SearchBar
        onSearch={setQuery}
        onPlaceSelect={pr => {
          const loc = pr.geometry?.location;
          if (!loc) return;
          setFocusCoord({ lat: loc.lat(), lng: loc.lng() });
          setMapZoom(15);
          setInfoPlace({
            id: pr.place_id || '',
            name: pr.name || '',
            address: pr.formatted_address || '',
            lat: loc.lat(),
            lng: loc.lng(),
            imageUrl: '',
            rating: 0,
            crowdTime: '',
            visitTime: '',
            travel: { walk: 0, drive: 0, transit: 0 },
          });
        }}
      />
  
      {/* + Filter button */}
      <button
        disabled={loading}
        onClick={() => {
          setDraftFilters(filters);
          setShowModal(true);
        }}
        className={`mb-4 rounded-[10px] px-3 py-1 transition-colors disabled:opacity-50 ${
          showModal
            ? 'bg-white text-[#022c44] border border-[#022c44]'
            : 'bg-[#022c44] text-white border border-transparent hover:bg-[#022c44]/90'
        }`}
      >
        + Filter
      </button>
  
      {loadError && (
        <p className="mt-4 text-center text-red-600">
          Failed to load Google Maps SDK: {loadError.message}
        </p>
      )}
  
      {/* Scrollable list */}
      <div className="space-y-4 pr-1">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 rounded-lg bg-gray-100 animate-pulse" />
          ))
        ) : combined.length === 0 ? (
          <p className="mt-4 text-center text-gray-500">No places found.</p>
        ) : (
          combined.map(p => {
            const isSaved = saved.some(sp => sp.id === p.id);
  
            return (
              <div
                key={p.id}
                onMouseEnter={() => setHighlight(p.id)}
                onMouseLeave={() => setHighlight(null)}
                onClick={() => {
                  setHighlight(p.id);
                  setFocusCoord({ lat: p.lat, lng: p.lng });
                  setMapZoom(15);
                  setInfoPlace(p);
                }}
              >
                <PlaceCard
                  place={p}
                  saved={isSaved}
                  onSave={togglePlace}
                  onAdd={async (id, time) => {
                    const selected = combined.find(pl => pl.id === id);
                    if (!selected) return;
  
                    const ok = await addToItinerary(selected, time);
                    if (!ok) alert(`Only three places allowed at ${time}.`);
                  }}
                  highlighted={highlightId === p.id}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  /* =========================================================================
   * FILTER MODAL overlay
   * =========================================================================*/
  const FilterModal = !showModal ? null : (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="animate-fade-in max-h-[80vh] w-96 overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-center text-xl font-semibold">Filter attractions</h2>

        <div className="space-y-2">
          {FILTER_OPTIONS.map(opt => (
            <label
              key={opt.type}
              className="flex cursor-pointer items-center space-x-2 text-sm"
            >
              <input
                type="checkbox"
                className="accent-blue-600"
                checked={draftFilters.includes(opt.type)}
                onChange={e =>
                  setDraftFilters(prev =>
                    e.target.checked
                      ? [...prev, opt.type]
                      : prev.filter(t => t !== opt.type),
                  )
                }
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>

        <div className="mt-6 flex justify-end space-x-2">
          <button
            className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </button>
          <button
            className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
            onClick={() => {
              setFilters(draftFilters);
              setShowModal(false);
              refreshRecommended();
            }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );

  /* =========================================================================
   * RIGHT column – MapPane
   * =========================================================================*/
  const right = (
    <MapPane
      places={combined}
      focusCoord={focusCoord}
      zoom={mapZoom}
      infoPlace={infoPlace}
      onInfoClose={() => setInfoPlace(null)}
      onMarkerClick={p => {
        setHighlight(p.id);
        setFocusCoord({ lat: p.lat, lng: p.lng });
        setMapZoom(15);
        setInfoPlace(p);
      }}
    />
  );

  /* =========================================================================
   * Render
   * =========================================================================*/
  return (
    <>
      <Layout
        activeTab="Explore Places"
        tripId={tripId}
        tripName={tripName}
        tripDate={tripDate}
        left={left}
        right={right}
        heroCollapsed={heroCollapsed}
      />
      {FilterModal}
    </>
  );
}
