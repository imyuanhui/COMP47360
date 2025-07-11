package com.group4.smarttrip.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.group4.smarttrip.services.SmartItineraryService;
import com.group4.smarttrip.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/smart-itinerary")
public class SmartItineraryController {

    private final SmartItineraryService smartItineraryService;
    private final JwtUtil jwtUtil;

    @PostMapping
    public ResponseEntity<?> generateSmartItinerary(@RequestBody String userInput, HttpServletRequest request) {
        try {
            // Step 1: Authenticate user
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.badRequest().body("Missing or invalid Authorization header.");
            }
            Long userId = jwtUtil.extractUserId(authHeader.substring(7));

            // Step 2: Generate smart itinerary via service
            Map<String, Object> tripDetails = smartItineraryService.generateSmartTrip(userInput, userId);
            return ResponseEntity.ok(tripDetails);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Failed to generate smart itinerary.");
        }
    }
}
