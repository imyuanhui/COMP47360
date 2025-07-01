/***********************************************************************
 * useItinerary.ts
 * --------------------------------------------------------------------
 * Global itinerary state kept in localStorage.
 * • add(place,time)   — returns false if the slot already has 3 places
 * • remove(id,time)
 ***********************************************************************/

import { useEffect, useState } from 'react';
import type { Place } from '../types';

const STORAGE_KEY = 'my-itinerary';

/** internal shape */
interface Entry {
  time: string;   // "14:00"
  place: Place;
}

export function useItinerary() {
  /* -------- state persisted to localStorage -------- */
  const [entries, setEntries] = useState<Entry[]>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Entry[]) : [];
  });

  /* persist on every change */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  /* -------- api -------- */
  const add = (place: Place, time: string) => {
    /* max 3 per slot */
    if (entries.filter(e => e.time === time).length >= 3) return false;

    setEntries(prev => [...prev, { time, place }]);
    return true;
  };

  const remove = (id: string, time: string) =>
    setEntries(prev => prev.filter(e => !(e.time === time && e.place.id === id)));

  return { entries, add, remove };
}
