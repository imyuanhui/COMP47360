package com.group4.smarttrip.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.group4.smarttrip.dtos.CreateDestinationRequest;
import com.group4.smarttrip.dtos.CreateTripRequest;
import com.group4.smarttrip.dtos.TripDto;
import com.group4.smarttrip.dtos.UserPreferences;
import com.group4.smarttrip.entities.Place;
import com.group4.smarttrip.mappers.TripMapper;
import com.group4.smarttrip.security.JwtUtil;
import com.group4.smarttrip.services.DestinationService;
import com.group4.smarttrip.services.GeminiService;
import com.group4.smarttrip.services.ItineraryService;
import com.group4.smarttrip.services.TripService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/smart-itinerary")
public class SmartItineraryController {

    private final GeminiService geminiService;
    private final ItineraryService itineraryService;
    private final TripService tripService;
    private final DestinationService destinationService;
    private final JwtUtil jwtUtil;
    private final ObjectMapper objectMapper;
    private final TripMapper tripMapper;

    @PostMapping
    public ResponseEntity<?> generateSmartItinerary(@RequestBody String userInput, HttpServletRequest request) {
        try {
            // Step 1: Authenticate user
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.badRequest().body("Missing or invalid Authorization header.");
            }
            Long userId = jwtUtil.extractUserId(authHeader.substring(7));

            // Step 2: Use Gemini to extract preferences
            String rawResponse = geminiService.callGemini(userInput);
            String preferenceJson = extractJsonBlock(rawResponse);
            UserPreferences preferences = objectMapper.readValue(preferenceJson, UserPreferences.class);

            // Step 3: Generate itinerary
            List<Place> itinerary = itineraryService.generateItinerary(preferences);
            if (itinerary.isEmpty()) {
                return ResponseEntity.ok("No matching destinations found for this input.");
            }

            // Step 4: Create Trip
            LocalDateTime now = LocalDateTime.now();
            int startHour = preferences.getStartingTime();
            int duration = preferences.getDuration();

            LocalDateTime startDateTime = now.withHour(startHour).withMinute(0);
            LocalDateTime endDateTime = startDateTime.plusHours(duration);

            CreateTripRequest tripRequest = new CreateTripRequest();
            tripRequest.setTripName("Smart Trip");
            tripRequest.setStartDateTime(startDateTime);
            tripRequest.setEndDateTime(endDateTime);
            tripRequest.setNumTravellers(1);

            TripDto createdTrip = tripService.createTrip(tripMapper.toEntity(tripRequest), userId);
            Long tripId = createdTrip.getTripId();

            // Step 5: Save destinations with timing
            double timePassed = 0.0;
            for (Place p : itinerary) {
                LocalDateTime visitTime = startDateTime.plusMinutes((long)(timePassed * 60));
                CreateDestinationRequest destReq = new CreateDestinationRequest(
                        tripId, p.getPlaceName(), p.getLat(), p.getLon(), visitTime
                );
                destinationService.createDestination(destReq);
                timePassed += p.getEstimatedDuration();
            }

            // Step 6: Return full trip details
            Map<String, Object> tripDetails = tripService.viewTrip(tripId);
            return ResponseEntity.ok(tripDetails);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Failed to generate smart itinerary.");
        }
    }

    private String extractJsonBlock(String geminiOutput) {
        // Trim backticks if Gemini wrapped JSON in a code block
        int startIndex = geminiOutput.indexOf("{");
        int endIndex = geminiOutput.lastIndexOf("}");
        if (startIndex != -1 && endIndex != -1 && endIndex > startIndex) {
            return geminiOutput.substring(startIndex, endIndex + 1);
        }
        throw new IllegalArgumentException("Gemini response does not contain valid JSON");
    }

}
