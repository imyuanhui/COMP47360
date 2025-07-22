/**********************************************************************
 * MyItinerary.tsx
 * --------------------------------------------------------------------
 * Displays a user’s itinerary for a specific trip.
 * - Left pane: Places grouped by time slots
 * - Right pane: Map with markers, popups, and remove-from-itinerary logic
 * 
 * This page is rendered when the user selects a trip to view/edit.
 *********************************************************************/

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import PlaceCard from '../components/PlaceCard';
import MapPane from '../components/MapPane';
import { useItinerary } from '../services/useItinerary';
import { fetchTripDetails, setAuthToken } from '../services/api';
import type { Place } from '../types';
import { fetchBusynessLevel } from '../services/useBusyness';
import type { BusynessLevel } from '../types';


/* ---------- Constants ---------- */
const SLOTS = Array.from({ length: 10 }, (_, i) =>
  `${(9 + i).toString().padStart(2, '0')}:00`, // Generates time slots from 09:00 to 18:00
);
const isBusynessLevel = (value: any): value is BusynessLevel =>
  ['low', 'med', 'high', 'unknown'].includes(value);

async function enrichWithBusyness(
  places: Place[]
): Promise<(Place & { busynessLevel: BusynessLevel })[]> {
  return await Promise.all(
    places.map(async (p) => {
      const rawLevel = await fetchBusynessLevel(p.lat, p.lng);
      const level = isBusynessLevel(rawLevel) ? rawLevel : 'unknown';
      return { ...p, busynessLevel: level };
    })
  );
}


const DEFAULT_CENTRE: google.maps.LatLngLiteral = {
  lat: 40.7422,
  lng: -73.9880, // Default map center (Manhattan)
};

/* =================================================================== */
/* Main Component                                                      */
/* =================================================================== */
export default function MyItinerary() {
  const { tripId } = useParams(); // Get trip ID from route parameters

  // Store trip name and date
  const [tripName, setTripName] = useState('Your Trip');
  const [tripDate, setTripDate] = useState('Date not set');
  
  /* ---------- Load Trip Details ---------- */
  useEffect(() => {
    if (!tripId) return;

    const loadTrip = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
        setAuthToken(token);

        const trip = await fetchTripDetails(tripId);
        setTripName(trip.basicInfo.tripName);
        setTripDate(
          new Date(trip.basicInfo.startDateTime).toLocaleDateString()
        );
      } catch (err) {
        console.error('Failed to fetch trip in MyItinerary:', err);
      }
    };

    loadTrip();
  }, [tripId]);

  if (!tripId) return <div>Error: No trip selected.</div>;

  /* ---------- Itinerary State ---------- */
  const { entries, remove } = useItinerary(tripId);
  const [placesWithBusyness, setPlacesWithBusyness] = useState<(Place & { busynessLevel: BusynessLevel })[]>([]);
useEffect(() => {
  const allPlaces = entries.map(e => e.place);
  enrichWithBusyness(allPlaces).then(setPlacesWithBusyness);
}, [entries]); // Custom hook to get/remove itinerary entries
  
  const [focusCoord, setFocusCoord] = useState<google.maps.LatLngLiteral | null>(null); // Map focus
  const [mapZoom, setMapZoom] = useState(13);                                            // Map zoom level
  const [highlightId, setHighlight] = useState<string | null>(null);                    // Highlighted card
  const [infoPlace, setInfoPlace] = useState<Place | null>(null);                       // Map popup state

  // handle mappane update
  useEffect(() => {
  if (infoPlace && !entries.some(e => e.place.id === infoPlace.id)) {
    setInfoPlace(null);
  }
}, [entries, infoPlace]);
  
  /** Build a Google Maps directions URL for the current trip. */
const buildMapsUrl = (): string | null => {
  if (!entries.length) return null;

  // Sort by time-slot order so 09:00 → 18:00 becomes origin → … → destination
  const ordered = [...entries].sort(
    (a, b) => SLOTS.indexOf(a.time) - SLOTS.indexOf(b.time),
  );

  // Google limits us to 10 way-points (origin + 8 waypoints + destination)
  const coords = ordered.slice(0, 10).map(e => `${e.place.lat},${e.place.lng}`);

  // 1 place → simple search; 2 + places → directions with waypoints
  if (coords.length === 1) {
    return `https://www.google.com/maps/search/?api=1&query=${coords[0]}`;
  }

  const origin      = coords[0];
  const destination = coords[coords.length - 1];
  const waypoints   = coords.slice(1, -1).join('|');      // pipe-delimited
  const url = `https://www.google.com/maps/dir/?api=1`
            + `&origin=${origin}`
            + `&destination=${destination}`
            + (waypoints ? `&waypoints=${encodeURIComponent(waypoints)}` : '')
            + `&travelmode=walking`;                      // feel free to change
  return url;
};
  /* ---------- Left Panel: Time-based Itinerary Cards ---------- */
  const left = (
    <div className="space-y-2 pr-1">
      {SLOTS.map(slot => {
        // Group places by their assigned time slot
        const places = entries
          .filter(e => e.time === slot)
          .map(e => e.place);

        if (places.length === 0) return null;

        return (
          <section key={slot}>
            {/* Time Slot Heading */}
            <div className="mb-4 text-center">
              <h4 className="text-lg font-semibold text-[#012b42]">{slot}</h4>
              <div className="mt-1 mx-auto w-1/2 border-b border-[#012b42]" />
            </div>

            {/* Place Cards in this Time Slot */}
            <div className="space-y-4">
              {places.map(p => (
                <div
                  key={p.id}
                  onMouseEnter={() => setHighlight(p.id)} // Highlight on hover
                  onMouseLeave={() => setHighlight(null)}
                  onClick={() => {
                    // Zoom to marker and show info popup
                    setHighlight(p.id);
                    setFocusCoord({ lat: p.lat, lng: p.lng });
                    setMapZoom(15);
                    setInfoPlace(p);
                  }}
                >
                  <PlaceCard
                    place={p}
                    onAdd={() => {}} // not needed here
                    onRemove={() => remove(p.id, slot)} // remove place from itinerary
                    saved
                    highlighted={highlightId === p.id}
                    hideItinerary={true}
                    timeSlot={slot}
                  />
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {/* Empty itinerary message */}
      {entries.length === 0 && (
        <p className="mt-6 text-center text-gray-500">
          You haven't added anything yet - use “+ My Itinerary” on the Explore page.
        </p>
      )}
    </div>
  );

  /* ---------- Right Panel: Map and Interactions ---------- */
  const right = (
   <MapPane
  places={placesWithBusyness}

           // All itinerary places as markers
      focusCoord={focusCoord ?? DEFAULT_CENTRE}     // Focus on selected or default
      zoom={mapZoom}                                // Zoom level
      infoPlace={infoPlace}                         // Current popup place
      onInfoClose={() => setInfoPlace(null)}        // Close popup
      onMarkerClick={p => {
        // Show info when marker clicked
        setHighlight(p.id);
        setFocusCoord({ lat: p.lat, lng: p.lng });
        setMapZoom(15);
        setInfoPlace(p);
      }}

      onRemoveFromItinerary={(place: Place) => {
        const entry = entries.find(e => e.place.id === place.id);
        if (entry) remove(place.id, entry.time);
        setInfoPlace(null); // Close popup after deletion
      }}
    />
  );

  /* ---------- Render Layout ---------- */
  return (
    <Layout
      activeTab="My Itinerary"
      tripId={tripId}
      tripName={tripName}
      tripDate={tripDate}
      left={left}             // Place list view
      right={right}           // Map view
      heroCollapsed={true}    // Collapsed banner layout
    />
  );
}
