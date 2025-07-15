import React, { useState, useEffect } from 'react';
import type { Place } from '../types';
import axios from 'axios';

interface Props {
  place: Place;
  onAdd: (id: string, time: string) => void;
  onSave?: (place: Place) => void;
  /**
   * If provided, the card will show a "– My Itinerary" button that calls
   * this handler instead of the usual "+ My Itinerary" dropdown.
   */
  onRemove?: (id: string, time?: string) => void;
  saved?: boolean;
  highlighted: boolean;
  hideItinerary?: boolean;
  showRating?: boolean;
  /** Optional time for busyness prediction (and to pass back on remove) */
  timeSlot?: string;
}

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
  const [openMenu, setOpenMenu] = useState(false);
  const [busynessLevel, setBusynessLevel] = useState<string | null>(null);

  /* ------- Esc-key closes dropdown ------- */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenMenu(false);
    };
    if (openMenu) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [openMenu]);

  /* ------- Fetch busyness level from API ------- */
  useEffect(() => {
    if (!place.lat || !place.lng) {
      setBusynessLevel(null);
      return;
    }

    const fetchBusyness = async () => {
      try {
        let url = `/api/busyness?lat=${place.lat}&lon=${place.lng}`;
        if (timeSlot) {
          const todayDate = new Date().toISOString().slice(0, 10);
          url += `&timestamp=${todayDate}T${timeSlot}:00`;
        }
        const { data } = await axios.get(url);
        setBusynessLevel(
          Array.isArray(data) ? data[0]?.busynessLevel ?? 'unknown' : data.busynessLevel ?? 'unknown',
        );
      } catch (err) {
        console.error('Failed to fetch busyness:', err);
        setBusynessLevel('unknown');
      }
    };

    fetchBusyness();
  }, [place.lat, place.lng, timeSlot]);

  /* --- class helpers ------------------------------------------------ */
  const baseBtn = 'min-w-[11rem] h-7 px-2 py-1 text-xs rounded whitespace-nowrap transition-colors';
  const ghostBtn = `${baseBtn} bg-gray-100 hover:bg-gray-200`;

  return (
    <div
      className={`p-4 rounded-lg border shadow-sm transition-colors ${
        highlighted ? 'border-blue-500' : 'border-gray-400'
      }`}
    >
      <div className="flex">
        <img
          src={place.imageUrl || '/placeholder.jpg'}
          alt={place.name}
          className="mr-4 h-24 w-24 flex-shrink-0 rounded-lg object-cover"
        />

        <div className="relative flex-1">
          <h3 className="pr-32 font-semibold leading-tight">{place.name}</h3>
          <p className="mb-1 truncate pr-32 text-sm text-gray-500">
            {place.address
              ?.replace(/\b\d{5}(-\d{4})?\b/, '') // remove ZIP anywhere
              .replace(/,\s*United States$/, '') // remove ', United States'
              .replace(/,\s*NY\b/, '') // remove 'NY'
              .replace(/\s{2,}/g, ' ') // remove double spaces from cleanup
              .replace(/,\s*$/, '') // trim trailing comma if any
              .trim()}
          </p>

          {place.crowdTime && (
            <p className="text-xs text-gray-600">Biggest crowds at {place.crowdTime}</p>
          )}
          {place.visitTime && (() => {
            const date = new Date(place.visitTime);
            const datePart = date.toLocaleDateString(undefined, {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            });
            const timePart = date.toTimeString().slice(0, 5); // e.g. "09:00"
            return (
              <p className="text-xs text-[#022c44] font-bold">
                Recommended visit at {datePart} at {timePart}
              </p>
            );
          })()}
          {place.rating !== undefined && (
            <p className="text-xs text-gray-600">Rating: {place.rating}/5</p>
          )}

{showRating && (
  <div className="flex justify-between items-center text-xs text-gray-600">
    <span>
      Busyness rating{timeSlot ? ` at ${timeSlot}` : ''}:{' '}
      {busynessLevel ? (
        <span
          className={`font-bold ${
            busynessLevel === 'low'
              ? 'text-green-600'
              : busynessLevel === 'med'
              ? 'text-orange-500'
              : busynessLevel === 'high'
              ? 'text-red-600'
              : ''
          }`}
        >
          {busynessLevel}
        </span>
      ) : (
        'Loading busyness...'
      )}
    </span>

    {onRemove && (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(place.id, timeSlot);
        }}
        className="text-red-700 hover:underline"
      >
        Remove from My Itinerary
      </button>
    )}
  </div>
)}

          {/* ───── Action buttons (Save / Itinerary) ───── */}
          {(onSave || (!onRemove && !hideItinerary)) && (
            <div className="absolute right-0 top-0 flex flex-col items-end space-y-1.5">
              {onSave && (
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // keep card click intact
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

              {/* ---- Itinerary (Add) ---- */}
              {!onRemove && !hideItinerary && (
                timeSlot ? (
                  /* Already added – show label instead of dropdown */
                  <button className={`${ghostBtn} cursor-default`} disabled>
                    Added&nbsp;to&nbsp;{timeSlot}&nbsp;timeslot
                  </button>
                ) : (
                  /* Not yet on itinerary – show slot picker */
                  <div className="relative">
                    <button onClick={() => setOpenMenu(!openMenu)} className={ghostBtn}>
                      Add to My Itinerary
                    </button>

                    {openMenu && (
                      <div className="absolute right-0 top-10 z-10 w-44 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
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
                        {TIMES.map((t) => (
                          <button
                            key={t}
                            onClick={(e) => {
                              e.stopPropagation();
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
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
