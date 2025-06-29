package com.group4.smarttrip.services;

import com.group4.smarttrip.entities.Zone;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class ZoneServiceTest {
    @Autowired
    private ZoneService zoneService;
    record LatLng(double lat, double lon) {}

    @Test
    void testGetAllZones() {
        List<Zone> zones = zoneService.getAllZones();

        zones.forEach(System.out::println);

        assertEquals(13, zones.size(), "There should be exactly 13 zones in the database");
    }

    @Test
    void testFindNearestZone() {
        Map<LatLng, Integer> locationToZoneMap = Map.of(
                new LatLng(40.7590118, -73.9844836), 0,
                new LatLng(40.7139689, -74.0089327), 6,
                new LatLng(40.7039608, -74.0118856), 4
        );

        for (Map.Entry<LatLng, Integer> entry : locationToZoneMap.entrySet()) {
            LatLng point = entry.getKey();
            int expectedZoneId = entry.getValue();

            Zone zone = zoneService.findNearestZone(point.lat(), point.lon(), 1.5);
            System.out.println(zone);

            assertNotNull(zone, "Zone should not be null for point: " + point);
            assertEquals(expectedZoneId, zone.getZoneId(), "Expected zone ID mismatch for point: " + point);
        }
    }
}
