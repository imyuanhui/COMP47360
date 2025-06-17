package com.group4.smarttrip.controllers;

import com.group4.smarttrip.dtos.CreateTripRequest;
import com.group4.smarttrip.dtos.TripDto;
import com.group4.smarttrip.entities.Trip;
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

    @GetMapping
    public ResponseEntity<?> getTrips(
            @RequestParam(defaultValue = "1") int page,
            HttpServletRequest request) {
        try {
            Long userId = extractUserId(request);
            List<TripDto> tripDtos = tripService.getUserTrips(userId, page);
            return ResponseEntity.ok(Map.of("Trips", tripDtos));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createTrip(@RequestBody CreateTripRequest createTripRequest, HttpServletRequest request) {
        try {
            Long userId = extractUserId(request);
            TripDto newTrip = tripService.createTrip(tripMapper.toEntity(createTripRequest), userId);
            return ResponseEntity.ok(newTrip);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }

    }

    @DeleteMapping("/{tripId}")
    public ResponseEntity<?> deleteTrip(@PathVariable Long tripId, HttpServletRequest request) {
        try {
            Long userId = extractUserId(request);
            Trip tripToDelete = tripService.getTripById(tripId);

            if (!tripToDelete.getUserId().equals(userId)) {
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


}
