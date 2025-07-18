/**********************************************************************
 * PlaceCard.tsx  — v5
 * --------------------------------------------------------------------
 * Card UI component that displays a Place’s details and interaction
 * options:
 *   • Add/Remove to My Itinerary (with time-picker dropdown)
 *   • Save / Remove from Saved Places
 *   • Show predicted busyness (memoised via useBusyness)
 *   • Export to Google Maps (opens selected place in Google Maps)
 *
 * NOTE: Clicking on the card itself now **no longer** opens Google Maps.
 *       Instead, opening in Google Maps is fully delegated to the explicit
 *       "Export to Google Maps" button, which is rendered only when
 *       `hideItinerary` is `true` (i.e. in My Itinerary and Saved Places
 *       contexts). This restores the expected behaviour where clicking
 *       the card merely selects / zooms the place on the in‑app map,
 *       as handled by the parent wrapper component.
 *********************************************************************/

import React, { useState, useEffect } from 'react';
import type { Place } from '../types';
import { useBusyness } from '../services/useBusyness';

/* ---------- Props Interface ---------- */
interface Props {
  place: Place;
  onAdd: (id: string, time: string) => void;
  onSave?: (place: Place) => void;
  onRemove?: (id: string, time?: string) => void;
  saved?: boolean;
  highlighted: boolean;
  hideItinerary?: boolean;
  showRating?: boolean;
  timeSlot?: string;
}

/* ---------- Time Slot Options (09:00 → 18:00) ---------- */
const TIMES = Array.from({ length: 10 }, (_, i) => `${(9 + i).toString().padStart(2, '0')}:00`);

export default function PlaceCard({
  place,
  onAdd,
  onSave,
  onRemove,
  saved = false,
  highlighted,
  hideItinerary = false,
  showRating = true,
  timeSlot,
}: Props) {
  /* ---------- Local State ---------- */
  const [openMenu, setOpenMenu] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(timeSlot ?? null);

  /* ---------- Predicted Busyness (memoised) ---------- */
  const busynessLevel = useBusyness(
    place.lat,
    place.lng,
    selectedTime ? `${new Date().toISOString().slice(0, 10)}T${selectedTime}:00` : undefined,
  );

  /* ---------- Close dropdown with Escape ---------- */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpenMenu(false);
    if (openMenu) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [openMenu]);

  /* ---------- Button Styling ---------- */
  const baseBtn  = 'min-w-[11rem] h-7 px-2 py-1 text-xs rounded whitespace-nowrap transition-colors';
  const ghostBtn = `${baseBtn} bg-gray-100 hover:bg-gray-200 flex items-center justify-center`;

  /* ---------- Helper: Build Google Maps URL ---------- */
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`;

  /* -------------------- Render Card -------------------- */
  return (
    <div
      className={`
        p-4 rounded-lg border shadow-sm transition-colors cursor-pointer
        ${highlighted ? 'border-blue-500' : 'border-gray-400'}
      `}
      /* Intentionally no onClick handler here – parent handles map focus */
    >
      <div className="flex">
        {/* ---------- Place Image ---------- */}
        <img
          src={place.imageUrl || '/placeholder.jpg'}
          alt={place.name}
          className="mr-4 min-h-24 h-auto w-24 flex-shrink-0 rounded-lg object-cover"
        />

        {/* ---------- Content Area ---------- */}
        <div className="relative flex-1 min-w-0 lg:pr-48">
          {/* Name and Cleaned Address */}
          <h3 className="font-semibold leading-tight">{place.name}</h3>
          <p className="mb-1 text-sm text-gray-500 lg:whitespace-normal">
            {place.address
              ?.replace(/\b\d{5}(-\d{4})?\b/, '')           // Remove ZIP code
              .replace(/,\s*United States$/, '')            // Remove country
              .replace(/,\s*NY\b/, '')                      // Remove "NY"
              .replace(/\s{2,}/g, ' ')                      // Collapse extra spaces
              .replace(/,\s*$/, '')                         // Trim trailing commas
              .trim()}
          </p>

          {/* ---Biggest Crowds at--- */}
          {place.crowdTime && (
            <p className="text-xs text-gray-600">Biggest crowds at {place.crowdTime}</p>
          )}

          {/* ---Recommended Visit Time--- */}
          {place.visitTime && (() => {
            const date     = new Date(place.visitTime);
            const datePart = date.toLocaleDateString(undefined, {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            });
            const timePart = date.toTimeString().slice(0, 5);
            return (
              <p className="text-xs font-bold text-[#022c44]">
                Recommended visit at {datePart} at {timePart}
              </p>
            );
          })()}

          {/* ---Rating x/5 --- */}
          {place.rating !== undefined && (
            <p className="text-xs text-gray-600">Rating: {place.rating}/5</p>
          )}

          {/* ---------- Busyness Rating with colour coded text ---------- */}
          {showRating && (
            <div className="text-xs text-gray-600">
              <p>
                {selectedTime
                  ? `Busyness rating at ${selectedTime}: `
                  : 'Current busyness rating: '}
                {busynessLevel ? (
                  <span
                    className={`font-bold ${
                      busynessLevel === 'low'  ? 'text-customTeal' :
                      busynessLevel === 'med'  ? 'text-customAmber':
                      busynessLevel === 'high' ? 'text-customPink' : ''
                    }`}
                  >
                    {busynessLevel}
                  </span>
                ) : (
                  'Loading busyness…'
                )}
              </p>
            </div>
          )}

          {/* ---------- Top-right Action Buttons ---------- */}
          {(onSave || onRemove || !hideItinerary) && (
            <div
              className="
                mt-2 w-full flex flex-col gap-1
                items-start
                lg:absolute lg:right-0 lg:top-0
                lg:w-auto lg:items-end
              "
            >
              {/* ---Export to Google Maps button (visible only in My Itinerary & Saved Places)--- */}
              {hideItinerary && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className={ghostBtn}
                >
                  <span>Export to Google Maps</span>
                  <img
                    src="/assets/google-icon.png"
                    alt="Google logo"
                    className="ml-1 inline-block h-4 w-4"
                  />
                </a>
              )}

              {/* ---Remove from Saved Places & Add to Saved Places buttons--- */}
              {onSave && (
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onSave(place);
                  }}
                  className={
                    saved
                      ? `${baseBtn} bg-red-100 text-red-700 hover:bg-red-200`
                      : `${baseBtn} bg-[#022c44] text-white hover:bg-[#022c44]/90`
                  }
                >
                  {saved ? 'Remove from Saved Places' : 'Add to Saved Places'}
                </button>
              )}

              {/* ---Remove from My Itinerary button--- */}
              {onRemove && selectedTime && (
                <button
                  onClick={() => {
                    onRemove(place.id, selectedTime);
                    setSelectedTime(null);
                  }}
                  className={`${baseBtn} bg-red-100 text-red-700 hover:bg-red-200`}
                >
                  Remove from My Itinerary
                </button>
              )}

              {/* ---Add to My Itinerary--- */}
              {!onRemove && !hideItinerary && (
                selectedTime ? (
                  <button
                    onClick={() => {
                      setSelectedTime(null);
                    }}
                    className={`${baseBtn} bg-red-100 text-red-700 hover:bg-red-200`}
                  >
                    Remove from My Itinerary
                  </button>
                ) : (
                  <div className="relative">
                    <button onClick={() => setOpenMenu(!openMenu)} className={ghostBtn}>
                      Add to My Itinerary
                    </button>

                    {openMenu && (
                      <div className="absolute right-0 top-10 z-10 w-44 rounded-lg border bg-white p-2 shadow-lg">
                        <div className="mb-2 flex items-center justify-between">
                          <p className="text-sm font-semibold leading-none">Add to your Trip</p>
                          <button
                            onClick={() => setOpenMenu(false)}
                            className="text-sm text-gray-400 hover:text-gray-600"
                            aria-label="Close"
                          >
                            x
                          </button>
                        </div>

                        {TIMES.map(t => (
                          <button
                            key={t}
                            onClick={e => {
                              e.stopPropagation();
                              onAdd(place.id, t);
                              setSelectedTime(t);
                              setOpenMenu(false);
                            }}
                            className="w-full rounded px-2 py-1 text-left text-xs hover:bg-gray-100"
                          >
                            {t} &nbsp; + Add to timeslot
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
