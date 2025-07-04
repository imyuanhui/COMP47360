import { useEffect, useState } from 'react';
import type { Place } from '../types';

export function useSavedPlaces(tripId: string) {
  const [saved, setSaved] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  const STORAGE_KEY = `saved-${tripId}`;

  // Load saved places from localStorage
  useEffect(() => {
    const loadSaved = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setSaved(JSON.parse(stored));
        }
      } catch (err) {
        console.error("Error loading saved places from localStorage:", err);
      } finally {
        setLoading(false);
      }
    };

    if (tripId) {
      loadSaved();
    }
  }, [tripId]);

  // Save to localStorage whenever saved[] changes
  useEffect(() => {
    if (tripId) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    }
  }, [saved, tripId]);

  // Add a place locally
  const addPlace = (place: Place) => {
    if (!place.name || saved.some(p => p.id === place.id)) return;
    setSaved(prev => [...prev, place]);
  };

  // Remove a place
  const removePlace = (placeId: string) => {
    setSaved(prev => prev.filter(p => p.id !== placeId));
  };

  return { saved, addPlace, removePlace, loading };
}
