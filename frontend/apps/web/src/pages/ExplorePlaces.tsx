/****************************************************************************************
 * ExplorePlaces.tsx
 * ------------------------------------------------------------------
 * Combined view that:
 *   • Shows 10 *recommended* places (random or filtered)
 *   • Lets users run a text search; search hits are stacked *above*
 *     recommendations without replacing them
 *   • Synchronises list ↔ map interactions
 *   • Offers a “+ Filter” modal with persistent checkboxes
 *
 *  STATE GROUPS
 *  ────────────
 *    UI / Fetch   : query, loading
 *    Filter modal : filters (applied), draftFilters (checkbox UI), showModal
 *    Data         : recommended[], searchResults[]
 *    Map / Hover  : focusCoord, mapZoom, highlightId, infoPlace
 *
 *  FLOW
 *  ────
 *    1. On mount → fetchRandomPlaces() (or filtered nearbySearch)
 *    2. User types → searchText() overlays up-to-10 hits
 *    3. User clicks a card or marker → map pans + zooms, InfoWindow opens,
 *       corresponding card border highlights.
 *****************************************************************************************/

import React, { useCallback, useEffect, useState } from 'react';
import Layout    from '../components/Layout';
import SearchBar from '../components/SearchBar';
import PlaceCard from '../components/PlaceCard';
import MapPane   from '../components/MapPane';
import { usePlacesSearch } from '../services/usePlacesSearch';
import { useSavedPlaces   } from '../services/useSavedPlaces';
import type { Place } from '../types';
import { useItinerary } from '../services/useItinerary';  
import { useLocation } from 'react-router-dom';
 // ⬅️ new

/* ------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------*/


const DEFAULT_CENTRE: google.maps.LatLngLiteral = { lat: 40.7831, lng: -73.9712 };

const FILTER_OPTIONS = [
  { type: 'museum',        label: 'Museums'         },
  { type: 'park',          label: 'Parks'           },
  { type: 'art_gallery',   label: 'Art Galleries'   },
  { type: 'shopping_mall', label: 'Shopping Malls'  },
  { type: 'library',       label: 'Libraries'       },
  { type: 'night_club',    label: 'Night-life'      },
] as const;
type FilterType = typeof FILTER_OPTIONS[number]['type'];

/* =========================================================================
 * Component
 * =========================================================================*/
export default function ExplorePlaces() {
  const location = useLocation();
  console.log("Location state:", location.state); 
  const tripName = location.state?.tripName || "Your Trip";
  const tripDateRaw = location.state?.tripDate;
const tripDate = tripDateRaw
  ? new Date(tripDateRaw).toLocaleDateString()
  : "Date not set";
  console.log("tripDateRaw:", tripDateRaw); 


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

  /* ───── Map & highlight ───── */
  const [focusCoord, setFocusCoord] = useState<google.maps.LatLngLiteral | null>(null);
  const [mapZoom,    setMapZoom]    = useState(13);
  const [highlightId,setHighlight]  = useState<string | null>(null);
  const [infoPlace,  setInfoPlace]  = useState<Place | null>(null);

  /* ───── Hooks ───── */
  const { isReady, fetchRandomPlaces, searchText, loadError } = usePlacesSearch();
  const { saved, addPlace } = useSavedPlaces();
  const { entries: itinerary, add: addToItinerary } = useItinerary();

  /* ------------------------------------------------------------------
   * Helper: (re)fetch recommended places (10 random / filtered)
   * ------------------------------------------------------------------*/
  const refreshRecommended = useCallback(() => {
    if (!isReady) return;
    setLoading(true);
    setMapZoom(13);         // reset zoom when list changes
    setInfoPlace(null);     // close any open InfoWindow

    const fetch = filters.length
      ? searchText('tourist attraction', DEFAULT_CENTRE, filters)
          .then(r => [...r].sort(() => Math.random() - 0.5).slice(0, 10))
      : fetchRandomPlaces(DEFAULT_CENTRE);

    fetch
      .then(r => {
        setRecommended(r);
        /* If no active search overlay, centre on first recommendation */
        if (!searchResults.length && r[0]) {
          setFocusCoord({ lat: r[0].lat, lng: r[0].lng });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isReady, filters, fetchRandomPlaces, searchText, searchResults.length]);

  /* Merge search + recommended (dedupe by id) */
  const combined: Place[] = [
    ...searchResults,
    ...recommended.filter(r => !searchResults.some(s => s.id === r.id)),
  ];

  /* =========================================================================
   * Effects
   * =========================================================================*/

  /* 1️⃣  Initial load + whenever filters change */
  useEffect(refreshRecommended, [refreshRecommended]);

  /* 2️⃣  Text search overlay */
  useEffect(() => {
    if (!isReady) return;

    const q = query.trim();
    if (q === '') {
      setSearchResults([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    searchText(q, DEFAULT_CENTRE, filters)
      .then(r => {
        if (cancelled) return;
        const top = r.slice(0, 10);
        setSearchResults(top);

        /* Zoom to first result */
        if (top[0]) {
          setFocusCoord({ lat: top[0].lat, lng: top[0].lng });
          setMapZoom(15);
        }
      })
      .catch(console.error)
      .finally(() => !cancelled && setLoading(false));

    return () => { cancelled = true; };
  }, [isReady, query, filters, searchText]);

  /* =========================================================================
   * LEFT column – SearchBar, Filter button, PlaceCard list
   * =========================================================================*/
  const left = (
    <>
      <SearchBar
        onSearch={setQuery}
        onPlaceSelect={pr => {
          /* Autocomplete selection: centre map + open InfoWindow */
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

      {/* + Filter button (opens modal) */}
      <button
        disabled={loading}
        onClick={() => { setDraftFilters(filters); setShowModal(true); }}
        className={`mb-4 rounded-[10px] px-3 py-1 transition-colors disabled:opacity-50 ${
          showModal
            ? 'bg-white text-[#022c44] border border-[#022c44]'
            : 'bg-[#022c44] text-white border border-transparent hover:bg-[#022c44]/90'
        }`}
      >
        + Filter
      </button>

      {/* SDK error banner (rare) */}
      {loadError && (
        <p className="mt-4 text-center text-red-600">
          Failed to load Google Maps SDK: {loadError.message}
        </p>
      )}

      {/* Scrollable list of PlaceCards */}
      <div className="space-y-4 pr-1">
        {loading ? (
          /* skeleton UI */
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 rounded-lg bg-gray-100 animate-pulse" />
          ))
        ) : combined.length === 0 ? (
          <p className="mt-4 text-center text-gray-500">No places found.</p>
        ) : (
          combined.map(p => (
            <div
              key={p.id}
              /* hover highlight syncs with marker hover */
              onMouseEnter={() => setHighlight(p.id)}
              onMouseLeave={() => setHighlight(null)}
              /* click card → zoom map + open InfoWindow */
              onClick={() => {
                setHighlight(p.id);
                setFocusCoord({ lat: p.lat, lng: p.lng });
                setMapZoom(15);
                setInfoPlace(p);
              }}
            >
              <PlaceCard
                place={p}
                saved={saved.some(sp => sp.id === p.id)}
                onSave={addPlace}
                onAdd={(id, time) => {
                  const p = combined.find(pl => pl.id === id);
                  if (!p) return;
                
                  /* try to add – alert if the slot is full */
                  if (!addToItinerary(p, time)) {
                    alert(`Only three places allowed at ${time}.`);
                  }
                }}
                highlighted={highlightId === p.id}
              />
            </div>
          ))
        )}
      </div>
    </>
  );

  /* =========================================================================
   * FILTER MODAL overlay
   * =========================================================================*/
  const FilterModal = !showModal ? null : (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="animate-fade-in max-h-[80vh] w-96 overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-center text-xl font-semibold">Filter attractions</h2>

        {/* checkbox list */}
        <div className="space-y-2">
          {FILTER_OPTIONS.map(opt => (
            <label key={opt.type} className="flex items-center space-x-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                className="accent-blue-600"
                checked={draftFilters.includes(opt.type)}
                onChange={e =>
                  setDraftFilters(prev =>
                    e.target.checked ? [...prev, opt.type] : prev.filter(t => t !== opt.type),
                  )
                }
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>

        {/* footer buttons */}
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
              setFilters(draftFilters);   // commit
              setShowModal(false);
              refreshRecommended();       // refresh list
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
        /* click marker → highlight card + zoom map */
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
      <Layout activeTab="Explore Places" tripName={tripName}  tripDate={tripDate}     left={left} right={right} />
      
      {FilterModal}
    </>
  );
}
