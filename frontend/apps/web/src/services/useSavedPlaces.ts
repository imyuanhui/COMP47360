import { useEffect, useState } from 'react';
import type { Place } from '../types';
import {
  setAuthToken,
  fetchTripDetails,
  addDestination,
  deleteDestination,
} from './api';

export function useSavedPlaces(tripId: string) {
  const [saved, setSaved] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  // Load saved places from backend
  useEffect(() => {
    const loadSaved = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        setAuthToken(token);

        const trip = await fetchTripDetails(tripId);

        const places: Place[] = trip.destinations.map((d) => ({
          id: d.destinationId.toString(),
          name: d.destinationName,
          address: '',
          imageUrl: '',
          lat: 0,
          lng: 0,
          rating: 0,
          crowdTime: '',
          visitTime: d.visitTime || '',
          travel: { walk: 0, drive: 0, transit: 0 },
        }));

        setSaved(places);
      } catch (err) {
        console.error("Error loading saved places:", err);
      } finally {
        setLoading(false);
      }
    };

    if (tripId) {
      loadSaved();
    }
  }, [tripId]);

  // Add a place with validation and error handling
  const addPlace = async (place: Place) => {
    try {
      if (!place.name) {
        console.warn("Place name missing, cannot save");
        return;
      }

      const placePayload = {
  tripId: tripId.toString(),   // convert to string
  destinationName: place.name,
  lat: typeof place.lat === "number" ? place.lat : 40.7831,
  lon: typeof place.lng === "number" ? place.lng : -73.9712,
 visitTime: new Date().toISOString(),
 // or any valid time string your backend expects

};


      console.log("▶️ Sending place to backend:", placePayload);

      await addDestination(tripId, placePayload);

      setSaved((prev) => (prev.some(p => p.id === place.id) ? prev : [...prev, place]));
    } catch (err: any) {
      if (err.response?.data) {
        console.error("❌ Backend response error:", err.response.data);
      } else if (err.message) {
        console.error("❌ Error message:", err.message);
      } else {
        console.error("❌ Unknown error:", err);
      }
      alert("Failed to save place. Please try again later.");
    }
  };

  // Remove a place
  const removePlace = async (placeId: string) => {
    try {
      const dest = saved.find((p) => p.id === placeId);
      if (!dest) return;

      await deleteDestination(tripId, parseInt(dest.id));
      setSaved((prev) => prev.filter((p) => p.id !== placeId));
    } catch (err) {
      console.error("Error removing saved place:", err);
    }
  };

  return { saved, addPlace, removePlace, loading };
}
