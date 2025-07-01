package com.group4.smarttrip.controllers;

import com.group4.smarttrip.dtos.*;
import com.group4.smarttrip.entities.Trip;
import com.group4.smarttrip.mappers.TripMapper;
import com.group4.smarttrip.security.JwtUtil;
import com.group4.smarttrip.services.DestinationService;
import com.group4.smarttrip.services.TripService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/trips")
public class TripController {

    private final TripService tripService;
    private final TripMapper tripMapper;
    private final DestinationService destinationService;
    private final JwtUtil jwtUtil;

    @GetMapping("/test")
    public String test() {
        return "Trip API working";
    }

    @GetMapping
    public ResponseEntity<?> getTrips(@RequestParam(defaultValue = "1") int page,
                                      HttpServletRequest request) {
        try {
            Long userId = extractUserId(request);
            List<TripDto> tripDtos = tripService.getUserTrips(userId, page);
            return ResponseEntity.ok(Map.of("Trips", tripDtos));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createTrip(@RequestBody CreateTripRequest createTripRequest,
                                        HttpServletRequest request) {
        try {
            Long userId = extractUserId(request);
            TripDto newTrip = tripService.createTrip(tripMapper.toEntity(createTripRequest), userId);
            return ResponseEntity.ok(newTrip);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{tripId}")
    public ResponseEntity<?> getTripDetails(@PathVariable Long tripId) {
        try {
            Map<String, Object> tripDetails = tripService.viewTrip(tripId);
            return ResponseEntity.ok(tripDetails);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{tripId}")
    public ResponseEntity<?> updateTrip(@PathVariable Long tripId,
                                        @RequestBody CreateTripRequest updateRequest,
                                        HttpServletRequest request) {
        Long userId = extractUserId(request);
        if (!isAuthorizedOrForbidden(userId, tripId)) {
            return forbiddenResponse();
        }

        try {
            TripDto updatedTrip = tripService.updateTrip(tripId, updateRequest);
            return ResponseEntity.ok(updatedTrip);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{tripId}")
    public ResponseEntity<?> deleteTrip(@PathVariable Long tripId, HttpServletRequest request) {
        Long userId = extractUserId(request);
        if (!isAuthorizedOrForbidden(userId, tripId)) {
            return forbiddenResponse();
        }

        try {
            tripService.deleteTrip(tripId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{tripId}/destinations")
    public ResponseEntity<?> createDestination(@PathVariable Long tripId,
                                               @RequestBody CreateDestinationRequest request,
                                               HttpServletRequest httpRequest) {
        Long userId = extractUserId(httpRequest);
        if (!isAuthorizedOrForbidden(userId, tripId)) {
            return forbiddenResponse();
        }
        return handleDestinationUpsert(request);
    }

    @PutMapping("/{tripId}/destinations")
    public ResponseEntity<?> updateDestination(@PathVariable Long tripId,
                                               @RequestBody UpdateDestinationRequest request,
                                               HttpServletRequest httpRequest) {
        Long userId = extractUserId(httpRequest);
        if (!isAuthorizedOrForbidden(userId, tripId)) {
            return forbiddenResponse();
        }
        return handleDestinationUpsert(request);
    }

    @DeleteMapping("/{tripId}/destinations")
    public ResponseEntity<?> deleteDestination(@PathVariable Long tripId,
                                               @RequestParam Long destinationId,
                                               HttpServletRequest request) {
        Long userId = extractUserId(request);
        if (!isAuthorizedOrForbidden(userId, tripId)) {
            return forbiddenResponse();
        }

        try {
            destinationService.deleteDestination(destinationId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    private Long extractUserId(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return jwtUtil.extractUserId(token);
        }
        throw new IllegalArgumentException("Authorization token is missing or invalid");
    }

    private boolean isAuthorizedOrForbidden(Long userId, Long tripId) {
        Trip trip = tripService.getTripById(tripId);
        return trip != null && trip.getUserId().equals(userId);
    }

    private ResponseEntity<?> forbiddenResponse() {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "You do not have permission to edit this trip."));
    }

    private ResponseEntity<?> handleDestinationUpsert(CreateDestinationRequest request) {
        try {
            DestinationDto destinationDto = destinationService.createDestination(request);
            return ResponseEntity.ok(destinationDto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    private ResponseEntity<?> handleDestinationUpsert(UpdateDestinationRequest request) {
        try {
            DestinationDto destinationDto = destinationService.updateDestination(request);
            return ResponseEntity.ok(destinationDto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }
}
