import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import PlaceCard from '../components/PlaceCard';
import MapPane from '../components/MapPane';
import { useItinerary } from '../services/useItinerary';
import { fetchTripDetails, setAuthToken } from '../services/api';
import type { Place } from '../types';

const SLOTS = Array.from({ length: 10 }, (_, i) =>
  `${(9 + i).toString().padStart(2, '0')}:00`,
);

const DEFAULT_CENTRE: google.maps.LatLngLiteral = { lat: 40.7422, lng: -73.9880 };

export default function MyItinerary() {
  const { tripId } = useParams();

  const [tripName, setTripName] = useState('Your Trip');
  const [tripDate, setTripDate] = useState('Date not set');

  useEffect(() => {
    if (!tripId) return;

    const loadTrip = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        setAuthToken(token);

        const trip = await fetchTripDetails(tripId);
        setTripName(trip.basicInfo.tripName);
        setTripDate(new Date(trip.basicInfo.startDateTime).toLocaleDateString());
      } catch (err) {
        console.error('Failed to fetch trip in MyItinerary:', err);
      }
    };

    loadTrip();
  }, [tripId]);

  if (!tripId) return <div>Error: No trip selected.</div>;

  const { entries, remove } = useItinerary(tripId);
  

  const [focusCoord, setFocusCoord] = useState<google.maps.LatLngLiteral | null>(null);
  const [mapZoom, setMapZoom] = useState(13);
  const [highlightId, setHighlight] = useState<string | null>(null);
  const [infoPlace, setInfoPlace] = useState<Place | null>(null);

  const left = (
    <div className="space-y-2 pr-1">
      {SLOTS.map(slot => {
        const places = entries.filter(e => e.time === slot).map(e => e.place);
        if (places.length === 0) return null;

        return (
          <section key={slot}>
            <div className="mb-4 text-center">
              <h4 className="text-lg font-semibold text-[#012b42]">{slot}</h4>
              <div className="mt-1 mx-auto w-1/2 border-b border-[#012b42]" />
            </div>

            <div className="space-y-4">
              {places.map(p => (
                <div
                  key={p.id}
                  onMouseEnter={() => setHighlight(p.id)}
                  onMouseLeave={() => setHighlight(null)}
                  onClick={() => {
                    setHighlight(p.id);
                    setFocusCoord({ lat: p.lat, lng: p.lng });
                    setMapZoom(15);
                    setInfoPlace(p);
                  }}
                >
                  <PlaceCard
                    place={p}
                    onAdd={() => {}}
                    onRemove={() => remove(p.id, slot)}
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
      {entries.length === 0 && (
        <p className="mt-6 text-center text-gray-500">
          You haven't added anything yet - use “+ My Itinerary” on the Explore page.
        </p>
      )}
    </div>
  );

  const right = (
    <MapPane
      places={entries.map(e => e.place)}
      focusCoord={focusCoord ?? DEFAULT_CENTRE}
      zoom={mapZoom}
      infoPlace={infoPlace}
      onInfoClose={() => setInfoPlace(null)}
      onMarkerClick={p => {
        setHighlight(p.id);
        setFocusCoord({ lat: p.lat, lng: p.lng });
        setMapZoom(15);
        setInfoPlace(p);
      }}
    />
  );

  return (
    <Layout
      activeTab="My Itinerary"
      tripId={tripId}
      tripName={tripName}
      tripDate={tripDate}
      left={left}
      right={right}
      heroCollapsed={true}
    />
  );
}
