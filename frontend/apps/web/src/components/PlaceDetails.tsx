// src/components/PlaceDetails.tsx
import React, { useEffect, useState } from 'react';

interface Props {
  place: google.maps.places.PlaceResult;
  onAddToSaved?: (place: google.maps.places.PlaceResult) => void;
  onAddToItinerary?: (place: google.maps.places.PlaceResult) => void;
}

export default function PlaceDetails({
  place,
  onAddToSaved,
  onAddToItinerary,
}: Props) {
  const [details, setDetails] = useState<google.maps.places.PlaceResult | null>(
    null,
  );

  /* Fetch full place data */
  useEffect(() => {
    if (!place.place_id) return;

    const svc = new google.maps.places.PlacesService(
      document.createElement('div'),
    );

    svc.getDetails({ placeId: place.place_id }, (res, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && res) {
        setDetails(res);
      }
    });
  }, [place]);

  if (!details) {
    return (
      <div className="p-4 border border-gray-200 rounded-lg bg-white mb-4">
        <p className="text-sm text-gray-500">Loading details…</p>
      </div>
    );
  }

  /* First photo (if any) */
  const photoUrl =
    details.photos?.[0]?.getUrl({ maxWidth: 256, maxHeight: 256 }) ?? null;

  /* Button classes with 10 px radius */
  const btnBase =
    'px-3 py-1 text-sm border border-[#022b43] text-[#022b43] bg-white ' +
    'hover:bg-[#022b43] hover:text-white focus:bg-[#022b43] focus:text-white ' +
    'active:bg-[#022b43] active:text-white transition-colors whitespace-nowrap ' +
    'rounded-[10px]'; // ← 10 px radius

  return (
    <div className="mb-4 p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
      <div className="flex items-start justify-between space-x-4">
        {/* Image + textual details */}
        <div className="flex items-start space-x-4">
          {photoUrl && (
            <img
              src={photoUrl}
              alt={details.name || 'Place photo'}
              className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
            />
          )}

          <div>
            <h2 className="text-lg font-semibold">{details.name}</h2>

            {details.formatted_address && (
              <p className="text-sm text-gray-600">
                {details.formatted_address}
              </p>
            )}

            {details.formatted_phone_number && (
              <p className="mt-2 text-sm">
                📞 {details.formatted_phone_number}
              </p>
            )}

            {details.website && (
              <a
                href={details.website}
                target="_blank"
                rel="noreferrer"
                className="block mt-2 text-sm text-blue-600 underline"
              >
                Visit website ↗
              </a>
            )}

            {details.opening_hours?.weekday_text && (
              <div className="mt-3">
                <p className="font-medium text-sm mb-1">Opening hours</p>
                <ul className="pl-4 list-disc text-xs text-gray-700 space-y-0.5">
                  {details.opening_hours.weekday_text.map(line => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col space-y-2">
          <button onClick={() => onAddToSaved?.(details)} className={btnBase}>
            + Saved Places
          </button>

          <button
            onClick={() => onAddToItinerary?.(details)}
            className={btnBase}
          >
            + My Itinerary
          </button>
        </div>
      </div>
    </div>
  );
}
