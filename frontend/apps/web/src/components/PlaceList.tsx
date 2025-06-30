// src/components/PlaceList.tsx
import React from 'react';
import PlaceCard from './PlaceCard';
import type { Place } from '../types';

interface Props {
  places: Place[] | null;
  onAdd: (id: string, time: string) => void;
  highlightId: string | null;
}

export default function PlaceList({ places, onAdd, highlightId }: Props) {
  if (!Array.isArray(places) || places.length === 0) {
    return <p className="text-center text-gray-500 mt-6">No places found</p>;
  }

  return (
    <div className="space-y-4">
      {places.map(p => (
        <PlaceCard
          key={p.id}
          place={p}
          onAdd={onAdd}
          highlighted={p.id === highlightId}
        />
      ))}
    </div>
  );
}
