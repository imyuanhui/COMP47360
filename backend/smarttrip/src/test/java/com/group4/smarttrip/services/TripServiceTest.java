package com.group4.smarttrip.services;

import com.group4.smarttrip.dtos.CreateTripRequest;
import com.group4.smarttrip.dtos.TripDto;
import com.group4.smarttrip.entities.Trip;
import com.group4.smarttrip.mappers.TripMapper;
import com.group4.smarttrip.repositories.TripRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class TripServiceTest {
    @Autowired
    private TripService tripService;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private TripMapper tripMapper;

    @BeforeEach
    void clearAll() {
        tripRepository.deleteAll();
    }

    private Long userId = 1L;

    @Test
    void testCreateTrip() {
        CreateTripRequest request = new CreateTripRequest();
        request.setTripName("Create Trip");
        request.setStartDateTime(LocalDateTime.of(2025, 6, 20, 1, 34, 20));
        request.setEndDateTime(LocalDateTime.of(2025, 6, 20, 4, 34, 20));
        request.setNumTravellers(1);
        request.setThumbnailUrl("test.com");

        TripDto newTripDto = tripService.createTrip(tripMapper.toEntity(request), userId);

        assertEquals(newTripDto.getTripName(), "Create Trip");
        assertNotNull(newTripDto.getCreatedAt());
        assertNotNull(newTripDto.getUpdatedAt());
    }

//    @Test
//    void testUpdateTrip() {
//        CreateTripRequest request1 = new CreateTripRequest();
//        request1.setTripName("Old Trip Name");
//        request1.setStartDateTime(LocalDateTime.of(2025, 6, 20, 1, 34, 20));
//        request1.setEndDateTime(LocalDateTime.of(2025, 6, 20, 4, 34, 20));
//        request1.setNumTravellers(1);
//        request1.setThumbnailUrl("test.com");
//        tripService.createTrip(tripMapper.toEntity(request1), userId);
//
//        Trip trip = tripRepository.findAll().get(0);
//        Long tripId = trip.getTripId();
//        LocalDateTime oldUpdatedAt = trip.getUpdatedAt();
//
//        CreateTripRequest request2 = new CreateUTripRequest();
//        request2.setTripName("New Trip Name");
//
//        TripDto updateTripDto = tripService.updateTrip(tripId, request2);
//
//        assertEquals("New Trip Name", updateTripDto.getTripName());
//        assertEquals(tripId, updateTripDto.getTripId());
//        assertNotEquals(oldUpdatedAt, updateTripDto.getUpdatedAt());
//    }

    @Test
    void testGetUserTrips() {
        CreateTripRequest request1 = new CreateTripRequest();
        request1.setTripName("Trip 1");
        request1.setStartDateTime(LocalDateTime.of(2025, 6, 20, 1, 34, 20));
        request1.setEndDateTime(LocalDateTime.of(2025, 6, 20, 4, 34, 20));
        request1.setNumTravellers(1);
        request1.setThumbnailUrl("test.com");
        tripService.createTrip(tripMapper.toEntity(request1), userId);

        CreateTripRequest request2 = new CreateTripRequest();
        request2.setTripName("Trip 2");
        request2.setStartDateTime(LocalDateTime.of(2025, 6, 20, 1, 34, 20));
        request2.setEndDateTime(LocalDateTime.of(2025, 6, 20, 4, 34, 20));
        request2.setNumTravellers(1);
        request2.setThumbnailUrl("test.com");
        tripService.createTrip(tripMapper.toEntity(request2), userId);

        int page = 1;

        List<TripDto> trips = tripService.getUserTrips(userId, page);

        assertEquals(2, trips.size());
        assertEquals("Trip 2", trips.get(0).getTripName());
    }

    @Test
    void testGetTripById_Success() {
        CreateTripRequest request = new CreateTripRequest();
        request.setTripName("Create Trip");
        request.setStartDateTime(LocalDateTime.of(2025, 6, 20, 1, 34, 20));
        request.setEndDateTime(LocalDateTime.of(2025, 6, 20, 4, 34, 20));
        request.setNumTravellers(1);
        request.setThumbnailUrl("test.com");

        TripDto tripDto = tripService.createTrip(tripMapper.toEntity(request), userId);

        Long tripId = tripDto.getTripId();

        Trip trip = tripService.getTripById(tripId);

        assertEquals(tripDto.getTripName(), trip.getTripName());
        assertTrue(Duration.between(tripDto.getCreatedAt(), trip.getCreatedAt()).abs().toMillis() < 5);
        assertTrue(Duration.between(tripDto.getCreatedAt(), trip.getCreatedAt()).abs().toMillis() < 5);

    }

    @Test
    void testGetTripById_NotFound() {
        assertThrows(IllegalArgumentException.class, () ->
                tripService.getTripById(1L));
    }

    @Test
    void testDeleteTrip_Success() {
        CreateTripRequest request = new CreateTripRequest();
        request.setTripName("Create Trip");
        request.setStartDateTime(LocalDateTime.of(2025, 6, 20, 1, 34, 20));
        request.setEndDateTime(LocalDateTime.of(2025, 6, 20, 4, 34, 20));
        request.setNumTravellers(1);
        request.setThumbnailUrl("test.com");

        TripDto tripDto = tripService.createTrip(tripMapper.toEntity(request), userId);

        Long tripId = tripDto.getTripId();

        tripService.deleteTrip(tripId);

        assertThrows(IllegalArgumentException.class, () ->
                tripService.getTripById(tripId));
    }

    @Test
    void testDeleteTrip_NotFound() {
        assertThrows(IllegalArgumentException.class, () ->
                tripService.deleteTrip(1L));
    }
}
