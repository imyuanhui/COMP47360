package com.group4.smarttrip.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.group4.smarttrip.dtos.CreateDestinationRequest;
import com.group4.smarttrip.dtos.CreateTripRequest;
import com.group4.smarttrip.dtos.TripDto;
import com.group4.smarttrip.dtos.UserPreferences;
import com.group4.smarttrip.entities.Place;
import com.group4.smarttrip.mappers.TripMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class SmartItineraryService {

    private final GeminiService geminiService;
    private final ItineraryService itineraryService;
    private final TripService tripService;
    private final DestinationService destinationService;
    private final ObjectMapper objectMapper;
    private final TripMapper tripMapper;

    public Map<String, Object> generateSmartTrip(String userInput, Long userId) throws Exception {
        // Step 1: Use Gemini to extract preferences
        String rawResponse = geminiService.callGemini(userInput);
        String preferenceJson = extractJsonBlock(rawResponse);
        UserPreferences preferences = objectMapper.readValue(preferenceJson, UserPreferences.class);

        // Step 2: Generate itinerary
        List<Place> itinerary = itineraryService.generateItinerary(preferences);
        if (itinerary.isEmpty()) {
            throw new IllegalStateException("No matching destinations found for this input.");
        }

        // Step 3: Create Trip
        LocalDateTime now = LocalDateTime.now();
        int startHour = preferences.getStartingTime();
        int duration = preferences.getDuration();

        // Always schedule for next day
        LocalDateTime startDateTime = now.plusDays(1).withHour(startHour).withMinute(0);
        LocalDateTime endDateTime = startDateTime.plusHours(duration);

        CreateTripRequest tripRequest = new CreateTripRequest();
        tripRequest.setTripName(preferences.getTripName());
        tripRequest.setStartDateTime(startDateTime);
        tripRequest.setEndDateTime(endDateTime);
        tripRequest.setNumTravellers(1);

        TripDto createdTrip = tripService.createTrip(tripMapper.toEntity(tripRequest), userId);
        Long tripId = createdTrip.getTripId();

        // Step 4: Save destinations with timing
        double timePassed = 0.0;
        for (Place p : itinerary) {
            LocalDateTime rawTime = startDateTime.plusMinutes((long) (timePassed * 60));
            LocalDateTime roundedTime = roundUpToNearest10Minutes(rawTime);
            CreateDestinationRequest destReq = new CreateDestinationRequest(
                    tripId, p.getPlaceName(), p.getLat(), p.getLon(), roundedTime
            );
            destinationService.createDestination(destReq);
            timePassed += p.getEstimatedDuration();
        }

        // Step 5: Return full trip details
        return tripService.viewTrip(tripId);
    }

    private String extractJsonBlock(String geminiOutput) {
        int startIndex = geminiOutput.indexOf("{");
        int endIndex = geminiOutput.lastIndexOf("}");
        if (startIndex != -1 && endIndex != -1 && endIndex > startIndex) {
            return geminiOutput.substring(startIndex, endIndex + 1);
        }
        throw new IllegalArgumentException("Gemini response does not contain valid JSON");
    }

    private LocalDateTime roundUpToNearest10Minutes(LocalDateTime time) {
        int minute = time.getMinute();
        int remainder = minute % 10;
        return remainder == 0 ? time : time.plusMinutes(10 - remainder);
    }
}
