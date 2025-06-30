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
 *   - Saved Places     (save button hidden via onSave undefined)
 *
 * Styling relies entirely on Tailwind classes—no extra CSS file.
 ***********************************************************************/

import React, { useState } from 'react';
import type { Place } from '../types';

/* ----------------------------- props ----------------------------- */
interface Props {
  place: Place;                                   // data to render
  onAdd:  (id: string, time: string) => void;     // itinerary callback
  onSave?: (place: Place) => void;                // save-list callback (optional)
  saved?: boolean;                                // disables save button
  highlighted: boolean;                           // blue border on hover
}

/* Time slots shown in the itinerary dropdown (localisable later). */
const TIMES = ['09:00', '12:00', '15:00', '18:00'];

export default function PlaceCard({
  place,
  onAdd,
  onSave,
  saved = false,
  highlighted,
}: Props) {
  const [openMenu, setOpenMenu] = useState(false);

  /* --- class helpers ------------------------------------------------ */
  const baseBtn  = 'w-28 px-2 py-1 text-xs rounded whitespace-nowrap transition-colors';
  const ghostBtn = `${baseBtn} bg-gray-100 hover:bg-gray-200`;

  /* --- render ------------------------------------------------------- */
  return (
    <div
      className={`p-4 rounded-lg border shadow-sm transition-colors ${
        highlighted ? 'border-blue-500' : 'border-gray-200'
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

            {/* itinerary dropdown */}
            <div className="relative">
              <button
                onClick={() => setOpenMenu(prev => !prev)}
                className={ghostBtn}
              >
                + My Itinerary
              </button>

              {openMenu && (
                <div className="absolute right-0 top-7 z-10 w-44 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
                  <p className="mb-2 text-sm font-semibold leading-none">Add to your Trip</p>
                  {TIMES.map(t => (
                    <button
                      key={t}
                      onClick={() => {
                        onAdd(place.id, t);
                        setOpenMenu(false);       // close dropdown
                      }}
                      className="w-full rounded px-2 py-1 text-left text-sm hover:bg-gray-100"
                    >
                      {t} &nbsp; + Add to timeslot
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========== 3. travel-time footer ========== */}
      <div className="mt-3 flex justify-between pr-4 text-xs text-gray-500">
        <span>🚶 {place.travel.walk} mins</span>
        <span>🚗 {place.travel.drive} mins</span>
        <span>🚇 {place.travel.transit} mins</span>
      </div>
    </div>
  );
}
