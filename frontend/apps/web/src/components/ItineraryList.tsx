// src/components/ItineraryList.tsx
import React from 'react';
import type { ItineraryItem } from '../types';

interface Props {
  items: ItineraryItem[];
  onRemove: (id: string) => void;
  highlightId: string | null;
}

export default function ItineraryList({ items, onRemove, highlightId }: Props) {
  return (
    <div className="space-y-4">
      {items.map(i => (
        <div
          key={i.id}
          className={`p-4 border rounded flex justify-between items-center ${
            i.id === highlightId ? 'border-blue-500' : ''
          }`}
        >
          <div>
            <h4 className="font-bold">{i.place.name}</h4>
            <p className="text-sm text-gray-600">{i.time}</p>
          </div>
          <button
            className="text-red-600 hover:underline"
            onClick={() => onRemove(i.id)}
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}
