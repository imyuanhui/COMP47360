package com.group4.smarttrip.controllers;

import com.group4.smarttrip.dtos.ZoneBusynessDto;
import com.group4.smarttrip.entities.Zone;
import com.group4.smarttrip.services.BusynessService;
import com.group4.smarttrip.services.ZoneService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/busyness")
public class BusynessController {

    private final BusynessService busynessService;
    private final ZoneService zoneService;

    /**
     * GET /api/busyness
     * - If lat/lon provided: return busyness for nearest zone, either current or future (with optional timestamp).
     */
    @GetMapping
    public ResponseEntity<?> getBusyness(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lon,
            @RequestParam(required = false) String timestamp) {

        try {
            // Case 1: lat/lon not provided → return busyness for all zones
            if (lat == null || lon == null) {
                List<Zone> zones = zoneService.getAllZones();
                List<ZoneBusynessDto> dtoList = zones.stream()
                        .map(zone -> busynessService.getCurrentBusynessByZone(zone.getZoneId()))
                        .collect(Collectors.toList());
                return ResponseEntity.ok(dtoList);
            }

            // Case 2: lat/lon provided → find nearest zone
            Zone nearestZone = zoneService.findNearestZone(lat, lon, 1.5);
            Long zoneId = nearestZone.getZoneId();

            ZoneBusynessDto dto;
            if (timestamp == null) {
                dto = busynessService.getCurrentBusynessByZone(zoneId);
            } else {
                LocalDateTime time = LocalDateTime.parse(timestamp);
                dto = busynessService.getFutureBusynessByZone(zoneId, time);
            }
            return ResponseEntity.ok(dto);

        } catch (DateTimeParseException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Invalid time format. Expected ISO 8601, e.g., 2025-07-01T15:00:00"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
