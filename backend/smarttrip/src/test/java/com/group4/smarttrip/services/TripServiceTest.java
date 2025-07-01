package com.group4.smarttrip.services;

import com.group4.smarttrip.dtos.CreateDestinationRequest;
import com.group4.smarttrip.dtos.CreateTripRequest;
import com.group4.smarttrip.dtos.DestinationDto;
import com.group4.smarttrip.dtos.TripDto;
import com.group4.smarttrip.entities.Destination;
import com.group4.smarttrip.entities.Place;
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
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class TripServiceTest {
    @Autowired
    private TripService tripService;

    @Autowired
    private TripRepository tripRepository;

//    @Autowired
//    private PlaceRepository placeRepository;
//
//    @Autowired
//    private TripVisitRepository tripVisitRepository;

    @Autowired
    private DestinationService destinationService;

    @Autowired
    private TripMapper tripMapper;

    @BeforeEach
    void clearAll() {
//        tripVisitRepository.deleteAll();
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

    @Test
    void testUpdateTrip() {
        CreateTripRequest request1 = new CreateTripRequest();
        request1.setTripName("Old Trip Name");
        request1.setStartDateTime(LocalDateTime.of(2025, 6, 20, 1, 34, 20));
        request1.setEndDateTime(LocalDateTime.of(2025, 6, 20, 4, 34, 20));
        request1.setNumTravellers(1);
        request1.setThumbnailUrl("test.com");
        tripService.createTrip(tripMapper.toEntity(request1), userId);

        Trip trip = tripRepository.findAll().get(0);
        Long tripId = trip.getTripId();
        LocalDateTime oldUpdatedAt = trip.getUpdatedAt();

        CreateTripRequest request2 = new CreateTripRequest();
        request2.setTripName("New Trip Name");

        TripDto updateTripDto = tripService.updateTrip(tripId, request2);

        assertEquals("New Trip Name", updateTripDto.getTripName());
        assertEquals(tripId, updateTripDto.getTripId());
        assertNotEquals(oldUpdatedAt, updateTripDto.getUpdatedAt());
    }

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

//    @Test
//    void testCreateOrUpdateTripVisit() {
//        // Arrange: create a trip
//        CreateTripRequest tripRequest = new CreateTripRequest();
//        tripRequest.setTripName("Trip with Visit");
//        tripRequest.setStartDateTime(LocalDateTime.of(2025, 6, 20, 1, 34, 20));
//        tripRequest.setEndDateTime(LocalDateTime.of(2025, 6, 20, 4, 34, 20));
//        tripRequest.setNumTravellers(1);
//        tripRequest.setThumbnailUrl("test.com");
//
//        TripDto tripDto = tripService.createTrip(tripMapper.toEntity(tripRequest), userId);
//        Long tripId = tripDto.getTripId();
//
//        Place place = placeRepository.findAll().stream()
//                .findFirst()
//                .orElseThrow(() -> new IllegalStateException("No place found in DB"));
//        Long placeId = place.getPlaceId();
//
//        TripVisitId tripVisitId = new TripVisitId(tripId, placeId);
//
//        // Act 1: Create trip visit
//        LocalDateTime time1 = LocalDateTime.of(2025, 6, 20, 14, 0);
//        CreateUpdateTripVisitRequest visitRequest1 = new CreateUpdateTripVisitRequest(tripId, placeId, time1);
//        TripVisitDto createdVisit = tripService.createOrUpdateTripVisit(visitRequest1);
//
//        // Assert creation
//        TripVisit fetchedVisit1 = tripVisitRepository.findById(tripVisitId)
//                .orElseThrow(() -> new AssertionError("Visit should be created"));
//        assertEquals(time1, fetchedVisit1.getVisitTime(), "Visit time should match time1");
//        assertEquals(createdVisit.getTripId(), tripId);
//        assertEquals(createdVisit.getPlaceId(), placeId);
//
//        // Act 2: Update trip visit
//        LocalDateTime time2 = LocalDateTime.of(2025, 6, 21, 9, 0);
//        CreateUpdateTripVisitRequest visitRequest2 = new CreateUpdateTripVisitRequest(tripId, placeId, time2);
//        TripVisitDto updatedVisit = tripService.createOrUpdateTripVisit(visitRequest2);
//
//        // Assert update
//        TripVisit fetchedVisit2 = tripVisitRepository.findById(tripVisitId)
//                .orElseThrow(() -> new AssertionError("Visit should still exist after update"));
//        assertEquals(time2, fetchedVisit2.getVisitTime(), "Visit time should be updated to time2");
//        assertEquals(updatedVisit.getVisitTime(), time2);
//    }
//
//    @Test
//    void testDeleteTripVisit() {
//        CreateTripRequest request = new CreateTripRequest();
//        request.setTripName("Trip with Visit");
//        request.setStartDateTime(LocalDateTime.of(2025, 6, 20, 1, 34, 20));
//        request.setEndDateTime(LocalDateTime.of(2025, 6, 20, 4, 34, 20));
//        request.setNumTravellers(1);
//        request.setThumbnailUrl("test.com");
//
//        TripDto tripDto = tripService.createTrip(tripMapper.toEntity(request), userId);
//        Long tripId = tripDto.getTripId();
//
//        Place place = placeRepository.findAll().getFirst();
//        Long placeId = place.getPlaceId();
//
//        LocalDateTime visitTime = LocalDateTime.of(2025, 6, 20, 14, 0);
//
//        tripService.createOrUpdateTripVisit(new CreateUpdateTripVisitRequest(tripId, placeId, visitTime));
//
//        tripService.deleteTripVisit(tripId, placeId);
//
//        Map<String, Object> tripDetail = tripService.viewTrip(tripId);
//
//        TripDto resultTripDto = (TripDto) tripDetail.get("basicInfo");
//        assertEquals(tripDto.getTripName(), resultTripDto.getTripName());
//        List<Map<String, Object>> visits = (List<Map<String, Object>>) tripDetail.get("visits");
//        assertEquals(0, visits.size());
//    }

    @Test
    void testViewTrip() {
        // Step 1: create trip
        CreateTripRequest request = new CreateTripRequest();
        request.setTripName("Trip with Visit");
        request.setStartDateTime(LocalDateTime.of(2025, 6, 20, 1, 34, 20));
        request.setEndDateTime(LocalDateTime.of(2025, 6, 20, 4, 34, 20));
        request.setNumTravellers(1);
        request.setThumbnailUrl("test.com");

        TripDto tripDto = tripService.createTrip(tripMapper.toEntity(request), userId);
        Long tripId = tripDto.getTripId();

        // Step 2: prepare a destination
        String destinationName = "Times Square";
        double lat = 40.758;
        double lon = -73.98;
        LocalDateTime visitTime = LocalDateTime.of(2025, 6, 20, 4, 34, 20);

        CreateDestinationRequest destRequest = new CreateDestinationRequest(tripId, destinationName, lat, lon, visitTime);

        destinationService.createDestination(destRequest);

        // Step 3: get and validate viewTrip
        Map<String, Object> tripDetail = tripService.viewTrip(tripId);

        TripDto resultTripDto = (TripDto) tripDetail.get("basicInfo");
        assertEquals(tripDto.getTripName(), resultTripDto.getTripName());

        List<DestinationDto> destinations = (List<DestinationDto>) tripDetail.get("destinations");
        assertEquals(1, destinations.size());

        // Step 4: validate destination
        DestinationDto dest = destinations.get(0);
        assertEquals(visitTime, dest.getVisitTime());
        assertEquals(dest.getDestinationName(), destinationName);
    }
}
