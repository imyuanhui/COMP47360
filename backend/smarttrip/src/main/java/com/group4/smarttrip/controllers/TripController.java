package com.group4.smarttrip.controllers;

import com.group4.smarttrip.dtos.CreateTripRequest;
import com.group4.smarttrip.dtos.CreateUpdateTripVisitRequest;
import com.group4.smarttrip.dtos.TripDto;
import com.group4.smarttrip.dtos.TripVisitDto;
import com.group4.smarttrip.entities.Trip;
import com.group4.smarttrip.entities.TripVisit;
import com.group4.smarttrip.mappers.TripMapper;
import com.group4.smarttrip.security.JwtUtil;
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
    private final JwtUtil jwtUtil;

    private Long extractUserId(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return jwtUtil.extractUserId(token);
        }
        throw new IllegalArgumentException("Authorization token is missing or invalid");
    }

    private boolean isAuthorized(Long userId, Long tripId) {
        Trip trip = tripService.getTripById(tripId);
        return trip.getUserId().equals(userId);
    }

    @GetMapping("/test")
    public String test() {
        return "Trip API working";
    }

    @GetMapping
    public ResponseEntity<?> getTrips(
            @RequestParam(defaultValue = "1") int page,
            HttpServletRequest request) {
        try {
            Long userId = extractUserId(request);
            List<TripDto> tripDtos = tripService.getUserTrips(userId, page);
            return ResponseEntity.ok(Map.of("Trips", tripDtos));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage()));
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
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }

    }

    @GetMapping("/{tripId}")
    public ResponseEntity<?> getTripDetails(@PathVariable Long tripId) {
        try {
            Map<String, Object> tripDetails = tripService.viewTrip(tripId);
            return ResponseEntity.ok(tripDetails);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{tripId}")
    public ResponseEntity<?> updateTrip(@PathVariable Long tripId,
                                        @RequestBody CreateTripRequest updateRequest,
                                        HttpServletRequest request) {
        try {
            Long userId = extractUserId(request);
            Trip tripToUpdate = tripService.getTripById(tripId);

            if (!userId.equals(tripToUpdate.getUserId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "You do not have permission to edit this trip."));
            }

            TripDto updatedTrip = tripService.updateTrip(tripId, updateRequest);
            return ResponseEntity.ok(updatedTrip);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{tripId}")
    public ResponseEntity<?> deleteTrip(@PathVariable Long tripId,
                                        HttpServletRequest request) {
        try {
            Long userId = extractUserId(request);
            Trip tripToDelete = tripService.getTripById(tripId);

            if (!userId.equals(tripToDelete.getUserId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "You do not have permission to delete this trip."));
            }

            tripService.deleteTrip(tripId);
            return ResponseEntity.noContent().build();

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{tripId}/visits")
    public ResponseEntity<?> createTripVisit(@PathVariable Long tripId,
                                             @RequestBody CreateUpdateTripVisitRequest request,
                                             HttpServletRequest httpRequest) {
        if (!isAuthorized(extractUserId(httpRequest), tripId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You do not have permission to edit this trip."));
        }
        return handleTripVisitUpsert(request);
    }

    @PutMapping("/{tripId}/visits")
    public ResponseEntity<?> updateTripVisit(@PathVariable Long tripId,
                                             @RequestBody CreateUpdateTripVisitRequest request,
                                             HttpServletRequest httpRequest) {
        if (!isAuthorized(extractUserId(httpRequest), tripId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You do not have permission to edit this trip."));
        }
        return handleTripVisitUpsert(request);
    }

    private ResponseEntity<?> handleTripVisitUpsert(CreateUpdateTripVisitRequest request) {
        try {
            TripVisitDto visit = tripService.createOrUpdateTripVisit(request);
            return ResponseEntity.ok(visit);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{tripId}/visits")
    public ResponseEntity<?> deleteTripVisit(@RequestBody Map<String, Long> body,
                                             HttpServletRequest request) {

        try {
            Long tripId = body.get("tripId");
            Long userId = extractUserId(request);

            Trip trip = tripService.getTripById(tripId);

            if (!trip.getUserId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "You do not have permission to edit this trip."));
            }

            Long placeId = body.get("placeId");

            if (tripId == null || placeId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Missing tripId or placeId"));
            }

            tripService.deleteTripVisit(tripId, placeId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }
}
