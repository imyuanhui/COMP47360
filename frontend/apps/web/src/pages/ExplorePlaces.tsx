/****************************************************************************************
 * ExplorePlaces.tsx — v6
 * ------------------------------------------------------------------
 * Combined view that:
 *   • Shows 10 *recommended* places (random or filtered)
 *   • Lets users run a text search; search hits are stacked *above* recommendations
 *   • Synchronises list ↔ map interactions
 *   • Offers a "+ Filter" modal with two columns:
 *       – Column 1 : attraction types (existing behaviour)
 *       – Column 2 : busyness level (low | med | high)
 *
 *  NOTE: All comments that already existed in the previous revision are kept verbatim.
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
import { fetchBusynessLevel } from '../services/useBusyness';   // NEW
import type { BusynessLevel } from '../types';


/* ------------------------------------------------------------------ */
/* Constants */
/* ------------------------------------------------------------------ */

/** Rough midpoint of Manhattan (used as centre for Nearby/Text search). */
const DEFAULT_CENTRE: google.maps.LatLngLiteral = { lat: 40.7422, lng: -73.9880 };

/** Radius that fully covers the island of Manhattan (~21 km × 3 km). */
const MANHATTAN_RADIUS = 5_500;            // metres

const FILTER_OPTIONS = [
  { type: 'museum',        label: 'Museums'        },
  { type: 'restaurant',    label: 'Restaurant'     },
  { type: 'cafe',          label: 'Cafe'           },
  { type: 'park',          label: 'Parks'          },
  { type: 'art_gallery',   label: 'Art Galleries'  },
  { type: 'shopping_mall', label: 'Shopping Malls' },
  { type: 'library',       label: 'Libraries'      },
  { type: 'night_club',    label: 'Night-life'     },
] as const;

type FilterType = typeof FILTER_OPTIONS[number]['type'];

/* NEW — busyness levels */
const BUSYNESS_LEVELS = ['low', 'med', 'high'] as const;


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
  
  /* ───── Filter‑modal state ───── */
  const [filters,      setFilters]      = useState<FilterType[]>([]);
  const [busyness,     setBusyness]     = useState<BusynessLevel | null>(null);      // NEW
  const [showModal,    setShowModal]    = useState(false);
  const [draftFilters, setDraftFilters] = useState<FilterType[]>([]);
  const [draftBusyness,setDraftBusyness]= useState<BusynessLevel | null>(null);     // NEW

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

  /* ─── Hero banner state ─── */
  const [heroCollapsed, setHeroCollapsed] = useState(false);
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);

  /* Toggle add/remove */
  const togglePlace = (place: Place) => {
    setSaved(prev =>
      prev.some(p => p.id === place.id)
        ? prev.filter(p => p.id !== place.id)
        : [...prev, place],
    );
  };
  const isBusynessLevel = (value: any): value is BusynessLevel =>
  ['low', 'med', 'high', 'unknown'].includes(value);

async function enrichWithBusyness(
  places: Place[]
): Promise<(Place & { busynessLevel: BusynessLevel })[]> {
  return await Promise.all(
    places.map(async (p) => {
      const rawLevel = await fetchBusynessLevel(p.lat, p.lng);
      const level = isBusynessLevel(rawLevel) ? rawLevel : ('unknown' as BusynessLevel);

      return {
        ...p,
        busynessLevel: level,
      };
    })
  );
}


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
   * Helper: filter places by current `busyness` selection (client‑side)
   * ------------------------------------------------------------------ */
  const applyBusyness = useCallback(async (list: Place[]): Promise<Place[]> => {
    if (!busyness) return list;                 // nothing selected → skip

    const out: Place[] = [];
    for (const p of list) {
      const lvl = await fetchBusynessLevel(p.lat, p.lng);
      if (lvl === busyness) out.push(p);
      if (out.length === 20) break;             // cap early – we never need more
    }
    return out;
  }, [busyness]);

  /* ------------------------------------------------------------------
   * Helper: refresh 10 recommended places (randomised)
   * ------------------------------------------------------------------ */
  const refreshRecommended = useCallback(() => {
    if (!isReady) return;
    setLoading(true);

    searchText(
        'tourist attraction OR restaurant OR museum',   // same query regardless of filters
        DEFAULT_CENTRE,
        filters,                                        // may be an empty array
        MANHATTAN_RADIUS,
    )
      .then(applyBusyness)
      .then(r => [...r].sort(() => Math.random() - 0.5).slice(0, 20))
      .then(setRecommended)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isReady, filters, applyBusyness, searchText]);

  /* 1️⃣ initial load + whenever filters OR busyness change */
  useEffect(refreshRecommended, [refreshRecommended]);

  /* 2️⃣ fetch trip details (name / date) — unchanged */
  useEffect(() => {
    if (!tripId) return;

    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
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
      .then(applyBusyness)
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
  }, [isReady, query, filters, applyBusyness, searchText]);
  useEffect(() => {
  const merged = [
    ...searchResults,
    ...recommended.filter(r => !searchResults.some(s => s.id === r.id)),
  ];
  enrichWithBusyness(merged).then(setCombined);
}, [searchResults, recommended]);

  /* Merge search + recommended and de‑duplicate by id */
  const [combined, setCombined] = useState<(Place & { busynessLevel: BusynessLevel })[]>([]);


  /* Reinstate the size of the hero image after 5 seconds */
  const handleCardHover = () => {
    setHeroCollapsed(true);
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
    inactivityTimer.current = setTimeout(() => {
      setHeroCollapsed(false);
    }, 20000);
  };

  /* =========================================================================
   * LEFT column – SearchBar, “+ Filter”, PlaceCard list
   * =========================================================================*/
  const left = (
    /* Collapse hero banner on first hover */
    <div onMouseEnter={handleCardHover}>
      <div className="flex items-center gap-2 mb-4">
        <button
          disabled={loading}
          onClick={() => {
            setDraftFilters(filters);
            setDraftBusyness(busyness);           // NEW
            setShowModal(true);
          }}
          className={`h-[42px] rounded-[10px] px-3 py-1 transition-colors disabled:opacity-50 whitespace-nowrap ${
            showModal
              ? 'bg-white text-[#022c44] border border-[#022c44]'
              : 'bg-[#022c44] text-white text-sm border border-transparent hover:bg-[#022c44]/90'
          }`}
        >
          Filter Search
        </button>

        <div className="flex-1">
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
        </div>
      </div>

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
          <p className="mt-4 text-center text-gray-500">Loading Places...</p>
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
   * FILTER MODAL overlay (two‑column layout)
   * =========================================================================*/
  const FilterModal = !showModal ? null : (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="animate-fade-in max-h-[80vh] w-[28rem] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-center text-xl font-semibold">Filter Search</h2>

        {/* ---------- two columns ---------- */}
        <div className="grid grid-cols-2 gap-6">
          {/* column 1 – attractions */}
          <div>
            <h3 className="mb-2 font-medium text-sm">Attractions</h3>
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
          </div>

          {/* column 2 – busyness */}
          <div>
            <h3 className="mb-2 font-medium text-sm">Busyness</h3>
            <div className="space-y-2">
              {BUSYNESS_LEVELS.map(level => (
                <label key={level} className="flex items-center space-x-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="busyness"
                    className="accent-blue-600"
                    checked={draftBusyness === level}
                    onChange={() => setDraftBusyness(level)}
                  />
                  <span className="capitalize">{level}</span>
                </label>
              ))}
              {/* “Any” */}
              <label className="flex items-center space-x-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="busyness"
                  className="accent-blue-600"
                  checked={draftBusyness == null}
                  onChange={() => setDraftBusyness(null)}
                />
                <span>Any</span>
              </label>
            </div>
          </div>
        </div>

        {/* buttons */}
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
              setBusyness(draftBusyness);
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
      focusCoord={focusCoord ?? DEFAULT_CENTRE}
      zoom={mapZoom}
      infoPlace={infoPlace}
      onInfoClose={() => setInfoPlace(null)}
      onMarkerClick={p => {
        setHighlight(p.id);
        setFocusCoord({ lat: p.lat, lng: p.lng });
        setMapZoom(15);
        setInfoPlace(p);
      }}
      saved={saved}
      onToggleSave={togglePlace}
      onAddToItinerary={async (place, time) => {
        const ok = await addToItinerary(place, time);
        if (!ok) alert(`Only three places allowed at ${time}.`);
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
