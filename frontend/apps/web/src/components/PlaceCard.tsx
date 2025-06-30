// src/components/PlaceCard.tsx
import React, { useState } from 'react';
import type { Place } from '../types';

interface Props {
  place: Place;
  onAdd: (id: string, time: string) => void;
  highlighted: boolean;
}

const times = ['12:00', '15:00', '18:00', '20:00'];

export default function PlaceCard({ place, onAdd, highlighted }: Props) {
  const [openMenu, setOpenMenu] = useState(false);

  return (
    <div className={`p-4 border rounded-lg ${highlighted ? 'border-blue-500' : 'border-gray-200'}`}>
      <div className="flex">
        <img src={place.imageUrl} alt={place.name} className="w-24 h-24 object-cover rounded-lg mr-4" />
        <div className="flex-1 relative">
          <h3 className="font-semibold">{place.name}</h3>
          <p className="text-sm text-gray-500 mb-1">{place.address}</p>
          <p className="text-xs text-gray-600">Biggest crowds at {place.crowdTime}</p>
          <p className="text-xs text-gray-600">Recommended visit at 12:00</p>
          <p className="text-xs text-gray-600">Rating: {place.rating}/5</p>

          <button
            onClick={() => setOpenMenu(!openMenu)}
            className="absolute top-0 right-0 px-2 py-1 bg-gray-100 text-xs rounded hover:bg-gray-200"
          >
            + Add to My Itinerary
          </button>

          {openMenu && (
            <div className="absolute top-6 right-0 w-40 bg-white border border-gray-200 rounded-lg shadow-lg p-2">
              <p className="font-semibold mb-1">Add to your Trip</p>
              {times.map(t => (
                <button
                  key={t}
                  onClick={() => onAdd(place.id, t)}
                  className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
                >
                  {t} &nbsp; + Add to timeslot
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex justify-between text-xs text-gray-500">
        <span>🚶 {place.travel.walk} mins</span>
        <span>🚗 {place.travel.drive} mins</span>
        <span>🚇 {place.travel.transit} mins</span>
      </div>
    </div>
  );
}
