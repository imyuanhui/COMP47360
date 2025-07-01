/***********************************************************************
 * PlaceCard.tsx
 * ---------------------------------------------------------------------
 * Card component that displays a single tourist attraction / POI.
 *
 *  • Thumbnail image, name + address, optional meta dots
 *  • "+ Saved Places" button     → parent persists to local storage
 *  • "+ My Itinerary" dropdown   → parent adds to selected time slot
 *  • Hover highlight             → matches marker hover on the map
 *
 * The same component is used in:
 *   - Explore Places   (save button visible)
 *   - My Itinerary     (itinerary button hidden + timeSlot prop)
 *   - Saved Places     (save button only, no busyness rating)
 *
 * Styling relies entirely on Tailwind classes—no extra CSS file.
 ***********************************************************************/

import React, { useState, useEffect } from 'react';
import type { Place } from '../types';

/* ----------------------------- props ----------------------------- */
interface Props {
  place: Place;                                   // data to render
  onAdd:  (id: string, time: string) => void;     // itinerary callback
  onSave?: (place: Place) => void;                // save-list callback (optional)
  saved?: boolean;                                // disables save button
  highlighted: boolean;                           // blue border on hover
  hideItinerary?: boolean;                        // hides "+ My Itinerary" button
  showRating?: boolean;                           // toggles busyness rating line (default TRUE)
  timeSlot?: string;                              // time used in My Itinerary view
}

/* Time slots shown in the itinerary dropdown (localisable later). */
const TIMES = Array.from({ length: 10 }, (_, i) => `${(9 + i).toString().padStart(2, '0')}:00`);

export default function PlaceCard({
  place,
  onAdd,
  onSave,
  saved = false,
  highlighted,
  hideItinerary = false,
  showRating = true,
  timeSlot,
}: Props) {
  const [openMenu, setOpenMenu] = useState(false);

  /* ------- Esc‑key closes dropdown ------- */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenMenu(false);
    };
    if (openMenu) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [openMenu]);

  /* --- class helpers ------------------------------------------------ */
  const baseBtn  = 'w-28 px-2 py-1 text-xs rounded whitespace-nowrap transition-colors';
  const ghostBtn = `${baseBtn} bg-gray-100 hover:bg-gray-200`;

  /* mock busyness rating */
  const getRatingText = () => {
    const levels = ['low', 'medium', 'high'];
    const level = levels[Math.floor(Math.random() * levels.length)];
    return timeSlot
      ? `Busyness rating at ${timeSlot}: ${level}`
      : `Current business rating: ${level}`;
  };

  /* --- render ------------------------------------------------------- */
  return (
    <div
      className={`p-4 rounded-lg border shadow-sm transition-colors ${
        highlighted ? 'border-blue-500' : 'border-gray-400'
      }`}
    >
      {/* ========== 1. thumbnail + textual details ========== */}
      <div className="flex">
        {/* picture */}
        <img
          src={place.imageUrl}
          alt={place.name}
          className="mr-4 h-24 w-24 flex-shrink-0 rounded-lg object-cover"
        />

        {/* details & buttons */}
        <div className="relative flex-1">
          <h3 className="pr-32 font-semibold leading-tight">{place.name}</h3>
          <p className="mb-1 truncate pr-32 text-sm text-gray-500">{place.address}</p>

          {/* meta tags (render only if present) */}
          {place.crowdTime && (
            <p className="text-xs text-gray-600">Biggest crowds at {place.crowdTime}</p>
          )}
          {place.visitTime && (
            <p className="text-xs text-gray-600">Recommended visit at {place.visitTime}</p>
          )}
          {place.rating !== undefined && (
            <p className="text-xs text-gray-600">Rating: {place.rating}/5</p>
          )}

          {/* dynamic busyness rating (hidden on Saved Places) */}
          {showRating && (
            <p className="text-xs text-gray-600">{getRatingText()}</p>
          )}

          {/* ========= 2. stacked action buttons (top-right) ========= */}
          <div className="absolute right-0 top-0 flex flex-col items-end space-y-1">
            {/* Save button – hidden on Saved Places page */}
            {onSave && (
              <button
                disabled={saved}
                onClick={() => onSave(place)}
                className={
                  saved
                    ? `${baseBtn} bg-green-100 text-green-700 cursor-default`
                    : `${baseBtn} bg-[#022c44] text-white hover:bg-[#022c44]/90`
                }
              >
                {saved ? '✓ Saved' : '+ Saved Places'}
              </button>
            )}

            {/* itinerary dropdown (optional) */}
            {!hideItinerary && (
              <div className="relative">
                <button onClick={() => setOpenMenu(prev => !prev)} className={ghostBtn}>
                  + My Itinerary
                </button>

                {openMenu && (
                  <div className="absolute right-0 top-7 z-10 w-44 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
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
                        onClick={() => {
                          onAdd(place.id, t);
                          setOpenMenu(false);
                        }}
                        className="w-full rounded px-2 py-1 text-left text-sm hover:bg-gray-100"
                      >
                        {t} &nbsp; + Add to timeslot
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========== 3. travel-time footer ========== */}
      {/* <div className="mt-3 flex justify-between pr-4 text-xs text-gray-500">
        <span>🚶 {place.travel.walk} mins</span>
        <span>🚗 {place.travel.drive} mins</span>
        <span>🚇 {place.travel.transit} mins</span>
      </div> */}
    </div>
  );
}