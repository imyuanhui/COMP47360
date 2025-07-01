/****************************************************************************************
 * useSavedPlaces.ts
 * ------------------------------------------------------------------
 * React hook that wraps “Saved Places” persistence.
 *
 *  • saved[]          Current list of saved <Place> objects
 *  • addPlace(p)      Idempotently add a place (no duplicates)
 *  • removePlace(id)  Delete by place.id
 *
 *  Implementation details
 *  ──────────────────────
 *    • Uses localStorage as the backing store (key = 'savedPlaces')
 *    • Serialises to JSON on every mutation; hydrates on mount
 *    • No external context provider needed — simply import the hook
 *      anywhere you need access to the saved list.
 *****************************************************************************************/

import { useCallback, useEffect, useState } from 'react';
import type { Place } from '../types';

const LS_KEY = 'savedPlaces';               // localStorage key

export function useSavedPlaces() {
  /* ------------------------------------------------------------------
   * 1. Reactive state for the saved list
   * ------------------------------------------------------------------*/
  const [saved, setSaved] = useState<Place[]>([]);

  /* ------------------------------------------------------------------
   * 2. Hydrate from localStorage on first render
   * ------------------------------------------------------------------*/
  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) setSaved(JSON.parse(raw) as Place[]);
  }, []);

  /* ------------------------------------------------------------------
   * 3. Persist to localStorage whenever the list changes
   * ------------------------------------------------------------------*/
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(saved));
  }, [saved]);

  /* ------------------------------------------------------------------
   * 4a. addPlace() – ignore duplicates by place.id
   * ------------------------------------------------------------------*/
  const addPlace = useCallback(
    (p: Place) =>
      setSaved(prev => (prev.some(q => q.id === p.id) ? prev : [...prev, p])),
    [],
  );

  /* ------------------------------------------------------------------
   * 4b. removePlace() – simple filter by id
   * ------------------------------------------------------------------*/
  const removePlace = useCallback(
    (id: string) => setSaved(prev => prev.filter(p => p.id !== id)),
    [],
  );

  /* ------------------------------------------------------------------
   * 5. Public API
   * ------------------------------------------------------------------*/
  return { saved, addPlace, removePlace };
}
