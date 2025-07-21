/***********************************************************************
 * SavedPlaces.tsx
 * ---------------------------------------------------------------------
 * Page that lists the user’s saved attractions and shows them on a map.
 ***********************************************************************/

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/Layout";
import PlaceCard from "../components/PlaceCard";
import MapPane from "../components/MapPane";
import { useSavedPlaces } from "../services/useSavedPlaces";
import { fetchTripDetails, setAuthToken } from "../services/api";
import type { Place } from "../types";
import type { BusynessLevel } from "../types";



/* default map centre: Manhattan */
const DEFAULT_CENTRE: google.maps.LatLngLiteral = {
  lat: 40.7422,
  lng: -73.988,
};

export default function SavedPlaces() {
  const { tripId } = useParams();
  const { saved, addPlace, removePlace, loading } = useSavedPlaces(tripId!);

  const [tripName, setTripName] = useState("Your Trip");
  const [tripDate, setTripDate] = useState("Date not set");

  const [focusCoord, setFocusCoord] =
    useState<google.maps.LatLngLiteral | null>(null);
  const [mapZoom, setMapZoom] = useState(13);
  const [highlightId, setHighlight] = useState<string | null>(null);
  const [infoPlace, setInfoPlace] = useState<Place | null>(null);

  useEffect(() => {
    if (!tripId) return;

    const loadTrip = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;
        setAuthToken(token);

        const trip = await fetchTripDetails(tripId);
        setTripName(trip.basicInfo.tripName);
        setTripDate(
          new Date(trip.basicInfo.startDateTime).toLocaleDateString()
        );
      } catch (err) {
        console.error("Failed to fetch trip in SavedPlaces:", err);
      }
    };

    loadTrip();
  }, [tripId]);

  // ✅ Enrich saved places inside the component
  const enriched: (Place & { busynessLevel: BusynessLevel })[] = saved.map((p) => ({
    ...p,
    busynessLevel: p.busynessLevel ?? 'unknown',
  }));

  const left = (
    <div className="space-y-4 pr-1">
      {saved.length === 0 ? (
        <p className="mt-6 text-center text-gray-500">No places saved yet.</p>
      ) : (
        saved.map((p) => (
          <PlaceCard
            key={p.id}
            place={p}
            saved
            onSave={() => removePlace(p.id)}
            onAdd={() => {}}
            highlighted={highlightId === p.id}
            hideItinerary={true}
          />
        ))
      )}
    </div>
  );

  const right = (
    <MapPane
      places={enriched}
      focusCoord={focusCoord ?? DEFAULT_CENTRE}
      zoom={mapZoom}
      infoPlace={infoPlace}
      onInfoClose={() => setInfoPlace(null)}
      onMarkerClick={(p) => {
        setHighlight(p.id);
        setFocusCoord({ lat: p.lat, lng: p.lng });
        setMapZoom(15);
        setInfoPlace(p);
      }}
    />
  );

  return (
    <Layout
      activeTab="Saved Places"
      tripId={tripId}
      tripName={tripName}
      tripDate={tripDate}
      left={left}
      right={right}
      heroCollapsed={true}
    />
  );
}
