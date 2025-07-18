import { useEffect, useState } from "react";
import type { Place } from "../types";
import {
  setAuthToken,
  fetchTripDetails,
  addDestination,
  deleteDestination,
} from "./api";
import { usePlacesSearch } from "./usePlacesSearch";

interface Entry {
  time: string; // normalized "HH:mm" for grouping
  place: Place;
}

const DEFAULT_CENTRE = { lat: 40.7831, lng: -73.9712 };

export function useItinerary(tripId: string) {
  const { isReady, searchText } = usePlacesSearch();

  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  // Extract time "HH:mm" from ISO datetime string
  const extractTime = (isoString: string) => {
    if (!isoString) return "";
    return isoString.slice(11, 16);
  };

  useEffect(() => {
    if (!tripId || !isReady) return;

    const loadItinerary = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        setAuthToken(token);

        const trip = await fetchTripDetails(tripId);

        // For each destination from backend, get enriched data from Google Places
        const enrichedItems: Entry[] = await Promise.all(
          trip.destinations.map(async (d) => {
            // Search Google Places by destination name + location
            const results = await searchText(d.destinationName, DEFAULT_CENTRE);
            const googlePlace = results?.[0]; // first match

            return {
              place: {
                id: d.destinationId.toString(),
                name: d.destinationName,
                lat: googlePlace?.lat ?? 0,
                lng: googlePlace?.lng ?? 0,
                address: googlePlace?.address ?? '',
                imageUrl: googlePlace?.imageUrl ?? '/placeholder.jpg',
                rating: googlePlace?.rating ?? 0,
                crowdTime: '',
                visitTime: d.visitTime || '',
                travel: { walk: 0, drive: 0, transit: 0 },
              },
              time: extractTime(d.visitTime || ''),
            };
          })
        );

        setEntries(enrichedItems);
      } catch (error) {
        console.error("Error loading itinerary:", error);
      } finally {
        setLoading(false);
      }
    };

    loadItinerary();
  }, [tripId, isReady, searchText]);

  // Add and remove remain the same but re-fetch enriched itinerary after add/remove

  const add = async (place: Place, time: string) => {
    try {
       const count = entries.filter(e => e.time === time).length;
    if (count >= 3) {
      alert(`Only three places allowed at ${time}.`);
      return false;
    }
      const todayStr = new Date().toISOString().slice(0, 10);
      const visitTime = `${todayStr}T${time}:00`;

      const payload = {
        tripId,
        destinationName: place.name,
        lat: place.lat || DEFAULT_CENTRE.lat,
        lon: place.lng || DEFAULT_CENTRE.lng,
        visitTime,
      };

      await addDestination(tripId, payload);

      // Reload with enrichment
      const trip = await fetchTripDetails(tripId);
      const enrichedItems: Entry[] = await Promise.all(
        trip.destinations.map(async (d) => {
          const results = await searchText(d.destinationName, DEFAULT_CENTRE);
          const googlePlace = results?.[0];

          return {
            place: {
              id: d.destinationId.toString(),
              name: d.destinationName,
              lat: googlePlace?.lat ?? 0,
              lng: googlePlace?.lng ?? 0,
              address: googlePlace?.address ?? '',
              imageUrl: googlePlace?.imageUrl ?? '/placeholder.jpg',
              rating: googlePlace?.rating ?? 0,
              crowdTime: '',
              visitTime: d.visitTime || '',
              travel: { walk: 0, drive: 0, transit: 0 },
            },
            time: extractTime(d.visitTime || ''),
          };
        })
      );
      setEntries(enrichedItems);

      return true;
    } catch (error) {
      console.error("Error adding to itinerary:", error);
      alert("Failed to add place to itinerary.");
      return false;
    }
  };

  const remove = async (placeId: string, time: string) => {
    try {
      await deleteDestination(tripId, parseInt(placeId));

      const trip = await fetchTripDetails(tripId);
      const enrichedItems: Entry[] = await Promise.all(
        trip.destinations.map(async (d) => {
          const results = await searchText(d.destinationName, DEFAULT_CENTRE);
          const googlePlace = results?.[0];

          return {
            place: {
              id: d.destinationId.toString(),
              name: d.destinationName,
              lat: googlePlace?.lat ?? 0,
              lng: googlePlace?.lng ?? 0,
              address: googlePlace?.address ?? '',
              imageUrl: googlePlace?.imageUrl ?? '/placeholder.jpg',
              rating: googlePlace?.rating ?? 0,
              crowdTime: '',
              visitTime: d.visitTime || '',
              travel: { walk: 0, drive: 0, transit: 0 },
            },
            time: extractTime(d.visitTime || ''),
          };
        })
      );
      setEntries(enrichedItems);
    } catch (error) {
      console.error("Error removing from itinerary:", error);
      alert("Failed to remove place from itinerary.");
    }
  };

  return { entries, add, remove, loading };
}
