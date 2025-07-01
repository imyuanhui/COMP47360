package com.group4.smarttrip.services;

import com.group4.smarttrip.dtos.CreateDestinationRequest;
import com.group4.smarttrip.dtos.DestinationDto;
import com.group4.smarttrip.dtos.UpdateDestinationRequest;
import com.group4.smarttrip.entities.Trip;
import com.group4.smarttrip.repositories.DestinationRepository;
import com.group4.smarttrip.repositories.TripRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class DestinationServiceTest {

    @Autowired
    private DestinationService destinationService;

    @Autowired
    private DestinationRepository destinationRepository;

    @Autowired
    private TripRepository tripRepository;

    private Long tripId;

    private final String destinationName = "Times Square";
    private final double lat = 40.758;
    private final double lon = -73.98;
    private final LocalDateTime visitTime = LocalDateTime.of(2025, 6, 20, 4, 34, 20);

    @BeforeEach
    void setUp() {
        destinationRepository.deleteAll();

        // get an existing trip to attach destination to
        List<Trip> trips = tripRepository.findAll();
        assertFalse(trips.isEmpty(), "No trips found in database, cannot run tests.");
        tripId = trips.get(trips.size() - 1).getTripId();
    }

    @Test
    void testCreateDestination() {
        CreateDestinationRequest request = new CreateDestinationRequest(tripId, destinationName, lat, lon, visitTime);
        DestinationDto newDestination = destinationService.createDestination(request);

        assertNotNull(newDestination.getDestinationId());
        assertEquals(tripId, newDestination.getTripId());
        assertEquals(destinationName, newDestination.getDestinationName());
        assertEquals(visitTime, newDestination.getVisitTime());
    }

    @Test
    void testGetDestinationsByTripId() {
        CreateDestinationRequest request = new CreateDestinationRequest(tripId, destinationName, lat, lon, visitTime);
        DestinationDto newDestination = destinationService.createDestination(request);

        List<DestinationDto> destinations = destinationService.getDestinationsByTripId(tripId);

        assertEquals(1, destinations.size());
        assertEquals(newDestination.getDestinationId(), destinations.get(0).getDestinationId());
    }

    @Test
    void testDeleteDestination() {
        CreateDestinationRequest request = new CreateDestinationRequest(tripId, destinationName, lat, lon, visitTime);
        DestinationDto newDestination = destinationService.createDestination(request);

        destinationService.deleteDestination(newDestination.getDestinationId());

        List<DestinationDto> destinations = destinationService.getDestinationsByTripId(tripId);
        assertTrue(destinations.isEmpty());
    }

    @Test
    void testUpdateDestination() {
        CreateDestinationRequest request = new CreateDestinationRequest(tripId, destinationName, lat, lon, visitTime);
        DestinationDto createdDestination = destinationService.createDestination(request);

        LocalDateTime updatedTime = LocalDateTime.of(2025, 7, 20, 4, 34, 20);
        UpdateDestinationRequest updateRequest = new UpdateDestinationRequest(createdDestination.getDestinationId(), updatedTime);

        DestinationDto updatedDestination = destinationService.updateDestination(updateRequest);

        assertEquals(updatedTime, updatedDestination.getVisitTime());
        assertEquals(createdDestination.getDestinationId(), updatedDestination.getDestinationId());
    }
}
