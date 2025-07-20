package com.group4.smarttrip.controllers;

import com.group4.smarttrip.dtos.ZoneBusynessDto;
import com.group4.smarttrip.entities.Zone;
import com.group4.smarttrip.services.BusynessService;
import com.group4.smarttrip.services.ZoneService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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

    private static final Logger logger = LoggerFactory.getLogger(BusynessController.class);

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
            logger.info("Incoming GET /api/busyness request: lat={}, lon={}, timestamp={}", lat, lon, timestamp);

            // Case 1: lat/lon not provided → return busyness for all zones
            if (lat == null || lon == null) {
                logger.info("No coordinates provided. Returning busyness for all zones.");
                List<Zone> zones = zoneService.getAllZones();
                List<ZoneBusynessDto> dtoList = zones.stream()
                        .map(zone -> busynessService.getCurrentBusynessByZone(zone.getZoneId()))
                        .collect(Collectors.toList());
                logger.info("Returned busyness for {} zones", dtoList.size());
                return ResponseEntity.ok(dtoList);
            }

            // Case 2: lat/lon provided → find nearest zone
            Zone nearestZone = zoneService.findNearestZone(lat, lon, 1.5);
            if (nearestZone == null) {
                logger.warn("No zone found within 1.5 km. Trying 3.0 km radius.");
                nearestZone = zoneService.findNearestZone(lat, lon, 3.0);
            }

            if (nearestZone == null) {
                logger.warn("No zone found within 3.0 km of lat={}, lon={}", lat, lon);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "No zone found near the given coordinates"));
            }

            Long zoneId = nearestZone.getZoneId();
            logger.info("Nearest zone found: ID={}, name={}", zoneId, nearestZone.getName());

            ZoneBusynessDto dto;
            if (timestamp == null) {
                logger.info("Fetching current busyness for zone {}", zoneId);
                dto = busynessService.getCurrentBusynessByZone(zoneId);
            } else {
                LocalDateTime time = LocalDateTime.parse(timestamp);
                logger.info("Fetching future busyness for zone {} at {}", zoneId, time);
                dto = busynessService.getFutureBusynessByZone(zoneId, time);
            }

            logger.info("Busyness response ready for zone {}", zoneId);
            return ResponseEntity.ok(dto);

        } catch (DateTimeParseException e) {
            logger.error("Invalid timestamp format: {}", timestamp);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Invalid time format. Expected ISO 8601, e.g., 2025-07-01T15:00:00"));
        } catch (IllegalArgumentException e) {
            logger.error("Error fetching busyness: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
