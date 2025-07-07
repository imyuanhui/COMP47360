package com.group4.smarttrip.services;

import com.group4.smarttrip.dtos.UserPreferences;
import com.group4.smarttrip.entities.Place;
import com.group4.smarttrip.repositories.PlaceRepository;
import com.group4.smarttrip.repositories.ZoneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

import static com.group4.smarttrip.utils.GeoUtils.haversineDistance;

@Service
@RequiredArgsConstructor
public class ItineraryService {
    private final PlaceRepository placeRepository;
    private final ZoneRepository zoneRepository;

    private static final Set<String> SINGLE_PLACE_CATEGORIES = Set.of(
            "cafe", "fast_food", "ice_cream", "restaurant", "massage"
    );

    public List<Place> generateItinerary(UserPreferences preferences) {
        List<Place> itinerary = new ArrayList<>();
        String zoneToUse = preferences.getZoneName();
        boolean needToDetermineZone = (zoneToUse == null);

        Map<String, List<Place>> categoryToPlaces = new HashMap<>();

        // 1) Collect candidate places per category
        for (String category : preferences.getPlaceCategory()) {
            List<Place> candidatePlaces;
            if (zoneToUse != null) {
                Long zoneIdToUse = getZoneIdByName(zoneToUse);
                candidatePlaces = placeRepository.findByZone_ZoneIdAndCategory(zoneIdToUse, category);
            } else {
                candidatePlaces = placeRepository.findByCategory(category);
            }

            if (!candidatePlaces.isEmpty()) {
                categoryToPlaces.put(category, candidatePlaces);
            }
        }

        // 2) Determine zone if needed
        if (needToDetermineZone) {
            zoneToUse = determineZoneFromCandidates(categoryToPlaces);
            if (zoneToUse == null) {
                Optional<Place> anyPlace = categoryToPlaces.values().stream()
                        .flatMap(List::stream).findFirst();
                zoneToUse = anyPlace.map(p -> p.getZone() != null ? p.getZone().getZoneName() : null).orElse(null);
            }
        }

        if (zoneToUse == null) {
            return Collections.emptyList();
        }

        // 3) Fetch final candidates with determined zone
        List<Place> finalCandidates = new ArrayList<>();
        Long zoneIdToUse = getZoneIdByName(zoneToUse);

        for (String category : preferences.getPlaceCategory()) {
            List<Place> candidatePlaces = placeRepository.findByZone_ZoneIdAndCategory(zoneIdToUse, category);
            if (!candidatePlaces.isEmpty()) {
                if (List.of("cafe", "fast_food", "ice_cream", "restaurant", "massage").contains(category)) {
                    finalCandidates.add(candidatePlaces.get(0));
                } else {
                    finalCandidates.addAll(candidatePlaces.subList(0, Math.min(3, candidatePlaces.size())));
                }
            }
        }

        // 4) Select POIs fitting in time budget, one per category
        double totalTime = 0.0;
        Set<String> includedCategories = new HashSet<>();

        // First pass: guarantee at least one place for each requested category
        for (String category : preferences.getPlaceCategory()) {
            List<Place> candidatePlaces = finalCandidates.stream()
                    .filter(p -> p.getCategory().equals(category))
                    .toList();

            if (!candidatePlaces.isEmpty()) {
                Place firstPlace = candidatePlaces.get(0);
                double duration = firstPlace.getEstimatedDuration();
                if (totalTime + duration <= preferences.getDuration()) {
                    itinerary.add(firstPlace);
                    totalTime += duration;
                    includedCategories.add(category);
                }
            }
        }

        // Second pass: fill remaining time with extra places from non-consumable categories
        for (Place place : finalCandidates) {
            if (totalTime >= preferences.getDuration()) break;

            // Only consider places from non-consumable categories
            if (!SINGLE_PLACE_CATEGORIES.contains(place.getCategory())) {
                // Skip if this place was already added in baseline
                boolean alreadyIncluded = itinerary.stream()
                        .anyMatch(p -> p.getPlaceId().equals(place.getPlaceId()));
                if (alreadyIncluded) continue;

                double duration = place.getEstimatedDuration();
                if (totalTime + duration <= preferences.getDuration()) {
                    itinerary.add(place);
                    totalTime += duration;
                }
            }
        }

        return getBestVisitingSequence(itinerary);
    }


    private Long getZoneIdByName(String zoneName) {
        return zoneRepository.findByZoneName(zoneName).stream()
                .findFirst()
                .map(zone -> zone.getZoneId())
                .orElseThrow(() -> new IllegalArgumentException("Zone not found: " + zoneName));
    }

    private String determineZoneFromCandidates(Map<String, List<Place>> categoryToPlaces) {
        for (Map.Entry<String, List<Place>> entry : categoryToPlaces.entrySet()) {
            if (entry.getValue().size() == 1) {
                Place place = entry.getValue().get(0);
                if (place.getZone() != null) {
                    return place.getZone().getZoneName();
                }
            }
        }
        return null;
    }

    private List<Place> getBestVisitingSequence(List<Place> places) {
        if (places == null || places.isEmpty()) return Collections.emptyList();

        List<Place> remaining = new ArrayList<>(places);
        List<Place> sequence = new ArrayList<>();

        // Start with the first place as the starting point
        Place current = remaining.remove(0);
        sequence.add(current);

        while (!remaining.isEmpty()) {
            // Find the nearest next place to current
            Place finalCurrent = current;
            Place next = remaining.stream()
                    .min(Comparator.comparingDouble(p -> haversineDistance(finalCurrent.getLat(), finalCurrent.getLon(), p.getLat(), p.getLon())))
                    .orElse(null);

            if (next == null) break;

            sequence.add(next);
            remaining.remove(next);
            current = next;
        }

        return sequence;
    }

}
