import React, { useState, useEffect } from 'react';
import type { Place } from '../types';
import axios from 'axios'; // Make sure axios is installed

interface Props {
  place: Place;
  onAdd: (id: string, time: string) => void;
  onSave?: (place: Place) => void;
  saved?: boolean;
  highlighted: boolean;
  hideItinerary?: boolean;
  showRating?: boolean;
  timeSlot?: string;  // Optional time for busyness prediction
}

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
  const [busynessLevel, setBusynessLevel] = useState<string | null>(null);

  /* ------- Esc‑key closes dropdown ------- */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenMenu(false);
    };
    if (openMenu) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [openMenu]);

  // Fetch busyness from API based on lat, lng and optional timeSlot
  useEffect(() => {
    if (!place.lat || !place.lng) {
      setBusynessLevel(null);
      return;
    }

    const fetchBusyness = async () => {
      try {
        let url = `/api/busyness?lat=${place.lat}&lon=${place.lng}`;
        if (timeSlot) {
          // If you have a date string, combine it here. For now, assume today:
          const todayDate = new Date().toISOString().slice(0, 10);
          const timestamp = `${todayDate}T${timeSlot}:00`;
          url += `&timestamp=${timestamp}`;
        }
        const response = await axios.get(url);
        const data = response.data;

        if (Array.isArray(data)) {
          setBusynessLevel(data[0]?.busynessLevel ?? 'unknown');
        } else {
          setBusynessLevel(data.busynessLevel ?? 'unknown');
        }
      } catch (error) {
        console.error('Failed to fetch busyness:', error);
        setBusynessLevel('unknown');
      }
    };

    fetchBusyness();
  }, [place.lat, place.lng, timeSlot]);

  /* --- class helpers ------------------------------------------------ */
  const baseBtn = 'w-28 px-2 py-1 text-xs rounded whitespace-nowrap transition-colors';
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
          <p className="mb-1 truncate pr-32 text-sm text-gray-500">{place.address}</p>

          {place.crowdTime && (
            <p className="text-xs text-gray-600">Biggest crowds at {place.crowdTime}</p>
          )}
          {place.visitTime && (
            <p className="text-xs text-gray-600">Recommended visit at {place.visitTime}</p>
          )}
          {place.rating !== undefined && (
            <p className="text-xs text-gray-600">Rating: {place.rating}/5</p>
          )}

          {showRating && (
            <p className="text-xs text-gray-600">
              {busynessLevel
                ? `Busyness rating${timeSlot ? ` at ${timeSlot}` : ''}: ${busynessLevel}`
                : 'Loading busyness...'}
            </p>
          )}

          <div className="absolute right-0 top-0 flex flex-col items-end space-y-1">
            {onSave && (
              <button
                disabled={saved}
                onClick={(e) => {
  e.stopPropagation(); // prevent parent click
  onSave(place);
}}

                className={
                  saved
                    ? `${baseBtn} bg-green-100 text-green-700 cursor-default`
                    : `${baseBtn} bg-[#022c44] text-white hover:bg-[#022c44]/90`
                }
              >
                {saved ? '✓ Saved' : '+ Saved Places'}
              </button>
            )}

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
                        onClick={(e) => {
  e.stopPropagation(); // prevent parent click
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
    </div>
  );
}
