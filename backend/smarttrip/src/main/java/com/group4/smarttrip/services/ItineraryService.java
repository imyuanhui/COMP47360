package com.group4.smarttrip.services;

import com.group4.smarttrip.dtos.UserPreferences;
import com.group4.smarttrip.entities.Place;
import com.group4.smarttrip.entities.Zone;
import com.group4.smarttrip.repositories.PlaceRepository;
import com.group4.smarttrip.repositories.ZoneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

import static com.group4.smarttrip.utils.GeoUtils.haversineDistance;

@Service
@RequiredArgsConstructor
public class ItineraryService {
    private final PlaceRepository placeRepository;
    private final ZoneRepository zoneRepository;
    private final ZoneService zoneService;

    private static final Set<String> SINGLE_PLACE_CATEGORIES = Set.of(
            "cafe", "fast_food", "food_court", "ice_cream", "restaurant", "bakery", "spa",
            "internet_cafe", "zoo", "aquarium", "karaoke"
    );

    private static final Set<String> FOOD_CATEGORIES = Set.of(
            "cafe", "fast_food", "food_court", "ice_cream", "restaurant", "bakery"
    );

    private static final List<Long> DEFAULT_ZONE_IDS = List.of(14L, 25L, 22L);
    private static final Random RANDOM = new Random();

    public List<Place> generateItinerary(UserPreferences preferences) {
        List<Place> selectedItinerary = new ArrayList<>();

        // 1) Determine candidate zones
        List<Long> candidateZoneIds = resolveZoneCandidates(preferences.getZoneName());

        // 2) Gather all place candidates by zone and category
        List<Place> finalCandidates = new ArrayList<>();
        for (long zoneId : candidateZoneIds) {
            for (String category : preferences.getPlaceCategory()) {
                List<Place> candidates = placeRepository.findByZone_ZoneIdAndCategory(zoneId, category);
                Collections.shuffle(candidates, RANDOM);
                if (!candidates.isEmpty()) {
                    if (SINGLE_PLACE_CATEGORIES.contains(category)) {
                        finalCandidates.add(candidates.get(0));
                    } else {
                        finalCandidates.addAll(candidates.subList(0, Math.min(3, candidates.size())));
                    }
                }
            }
        }

        // 3) Select places that fit in the time budget
        double totalTimeUsed = 0.0;
        Set<String> includedCategories = new HashSet<>();
        Set<Long> usedPlaceIds = new HashSet<>();
        Set<String> usedPlaceNames = new HashSet<>();

        // First pass: ensure each requested category is represented
        for (String category : preferences.getPlaceCategory()) {
            Optional<Place> match = finalCandidates.stream()
                    .filter(p -> p.getCategory().equals(category) && !usedPlaceIds.contains(p.getPlaceId()))
                    .findFirst();
            if (match.isPresent()) {
                Place p = match.get();
                double duration = p.getEstimatedDuration();
                if (totalTimeUsed + duration <= preferences.getDuration()) {
                    selectedItinerary.add(p);
                    usedPlaceIds.add(p.getPlaceId());
                    usedPlaceNames.add(p.getPlaceName());
                    totalTimeUsed += duration;
                    includedCategories.add(category);
                }
            }
        }

        // Second pass: fill remaining time with other non-single-use POIs
        for (Place place : finalCandidates) {
            if (totalTimeUsed >= preferences.getDuration()) break;
            if (usedPlaceIds.contains(place.getPlaceId()) || usedPlaceNames.contains(place.getPlaceName())) continue;
            if (SINGLE_PLACE_CATEGORIES.contains(place.getCategory())) continue;

            double duration = place.getEstimatedDuration();
            if (totalTimeUsed + duration <= preferences.getDuration()) {
                selectedItinerary.add(place);
                usedPlaceIds.add(place.getPlaceId());
                usedPlaceNames.add(p.getPlaceName());
                totalTimeUsed += duration;
            }
        }

        return arrangeVisitingSequence(selectedItinerary, preferences.getStartingTime());
    }

    private List<Long> resolveZoneCandidates(String zoneName) {
        if (zoneName == null) return DEFAULT_ZONE_IDS;

        return zoneService.getZoneByName(zoneName)
                .map(zone -> zoneService.getTop3NearestZones(zone.getCentralLat(), zone.getCentralLon())
                        .stream()
                        .map(Zone::getZoneId)
                        .collect(Collectors.toList()))
                .orElse(DEFAULT_ZONE_IDS);
    }


    private List<Place> arrangeVisitingSequence(List<Place> places, int startHour) {
        if (places == null || places.isEmpty()) return Collections.emptyList();

        List<Place> foodPlaces = places.stream()
                .filter(p -> FOOD_CATEGORIES.contains(p.getCategory()))
                .collect(Collectors.toList());

        List<Place> nonFoodPlaces = places.stream()
                .filter(p -> !FOOD_CATEGORIES.contains(p.getCategory()))
                .collect(Collectors.toList());

        // Sort non-food places based on proximity using greedy nearest neighbor
        List<Place> sequence = new ArrayList<>();
        if (!nonFoodPlaces.isEmpty()) {
            Place current = nonFoodPlaces.remove(0);
            sequence.add(current);

            while (!nonFoodPlaces.isEmpty()) {
                Place finalCurrent = current;
                Place next = nonFoodPlaces.stream()
                        .min(Comparator.comparingDouble(p -> haversineDistance(finalCurrent.getLat(), finalCurrent.getLon(), p.getLat(), p.getLon())))
                        .orElse(null);

                if (next == null) break;

                sequence.add(next);
                nonFoodPlaces.remove(next);
                current = next;
            }
        }

        // Insert food places logically based on total trip duration and start time
        int currentHour = startHour;
        for (Place place : sequence) {
            currentHour += (int) Math.round(place.getEstimatedDuration());
        }

        int foodInsertHour = Math.max(12, Math.min(14, startHour + 3)); // Try to insert food around lunch
        List<Place> finalItinerary = new ArrayList<>();
        currentHour = startHour;

        for (Place place : sequence) {
            // Insert food if near lunch time
            if (!foodPlaces.isEmpty() && currentHour >= foodInsertHour && currentHour <= foodInsertHour + 1) {
                finalItinerary.add(foodPlaces.remove(0));
            }
            finalItinerary.add(place);
            currentHour += (int) Math.round(place.getEstimatedDuration());
        }

        // Add remaining food places at the end
        finalItinerary.addAll(foodPlaces);

        return finalItinerary;
    }
}
