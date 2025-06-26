package com.group4.smarttrip.services;

import com.group4.smarttrip.entities.Zone;
import com.group4.smarttrip.repositories.ZoneRepository;
import com.group4.smarttrip.utils.GeoUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ZoneService {

    private final ZoneRepository zoneRepository;

    public List<Zone> getAllZones() {
        return zoneRepository.findAll();
    }

    public Zone findNearestZone(double lat, double lon, double maxDistanceKm) {
        List<Zone> allZones = getAllZones();
        return allZones.stream()
                .filter(zone -> GeoUtils.haversineDistance(lat, lon, zone.getCentralLat(), zone.getCentralLon()) <= maxDistanceKm)
                .min(Comparator.comparingDouble(zone -> GeoUtils.haversineDistance(lat, lon, zone.getCentralLat(), zone.getCentralLon())))
                .orElse(null);
    }

    public Optional<Zone> getZoneById(long zoneId) {
        return zoneRepository.findById(zoneId);
    }
}
