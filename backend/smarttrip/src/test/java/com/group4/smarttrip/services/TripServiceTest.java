package com.group4.smarttrip.services;

import com.group4.smarttrip.dtos.CreateTripRequest;
import com.group4.smarttrip.dtos.TripDto;
import com.group4.smarttrip.entities.Place;
import com.group4.smarttrip.entities.Trip;
import com.group4.smarttrip.entities.TripVisit;
import com.group4.smarttrip.entities.TripVisitId;
import com.group4.smarttrip.mappers.TripMapper;
import com.group4.smarttrip.repositories.PlaceRepository;
import com.group4.smarttrip.repositories.TripRepository;
import com.group4.smarttrip.repositories.TripVisitRepository;
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

    @Autowired
    private PlaceRepository placeRepository;

    @Autowired
    private TripVisitRepository tripVisitRepository;

    @Autowired
    private TripMapper tripMapper;

    @BeforeEach
    void clearAll() {
        tripVisitRepository.deleteAll();
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

    @Test
    void testCreateOrUpdateTripVisit() {
        // Step 1: create trip
        CreateTripRequest request = new CreateTripRequest();
        request.setTripName("Trip with Visit");
        request.setStartDateTime(LocalDateTime.of(2025, 6, 20, 1, 34, 20));
        request.setEndDateTime(LocalDateTime.of(2025, 6, 20, 4, 34, 20));
        request.setNumTravellers(1);
        request.setThumbnailUrl("test.com");

        TripDto tripDto = tripService.createTrip(tripMapper.toEntity(request), userId);
        Long tripId = tripDto.getTripId();

        Place place = placeRepository.findAll().getFirst();
        Long placeId = place.getPlaceId();

        // First call: should create
        LocalDateTime time1 = LocalDateTime.of(2025, 6, 20, 14, 0);
        tripService.createOrUpdateTripVisit(tripId, placeId, time1);

        TripVisitId id = new TripVisitId(tripId, placeId);
        TripVisit createdVisit = tripVisitRepository.findById(id).orElseThrow();
        assertEquals(time1, createdVisit.getVisitTime());

        // Second call: should update
        LocalDateTime time2 = LocalDateTime.of(2025, 6, 21, 10, 0);
        tripService.createOrUpdateTripVisit(tripId, placeId, time2);

        TripVisit updatedVisit = tripVisitRepository.findById(id).orElseThrow();
        assertEquals(time2, updatedVisit.getVisitTime());
    }

    @Test
    void testDeleteTripVisit() {
        CreateTripRequest request = new CreateTripRequest();
        request.setTripName("Trip with Visit");
        request.setStartDateTime(LocalDateTime.of(2025, 6, 20, 1, 34, 20));
        request.setEndDateTime(LocalDateTime.of(2025, 6, 20, 4, 34, 20));
        request.setNumTravellers(1);
        request.setThumbnailUrl("test.com");

        TripDto tripDto = tripService.createTrip(tripMapper.toEntity(request), userId);
        Long tripId = tripDto.getTripId();

        Place place = placeRepository.findAll().getFirst();
        Long placeId = place.getPlaceId();

        LocalDateTime visitTime = LocalDateTime.of(2025, 6, 20, 14, 0);

        tripService.createOrUpdateTripVisit(tripId, placeId, visitTime);

        tripService.deleteTripVisit(tripId, placeId);

        Map<String, Object> tripDetail = tripService.viewTrip(tripId);

        TripDto resultTripDto = (TripDto) tripDetail.get("basicInfo");
        assertEquals(tripDto.getTripName(), resultTripDto.getTripName());
        List<Map<String, Object>> visits = (List<Map<String, Object>>) tripDetail.get("visits");
        assertEquals(0, visits.size());
    }

    @Test
    void testCreateTripVisitAndViewTrip() {
        // Step 1: create trip
        CreateTripRequest request = new CreateTripRequest();
        request.setTripName("Trip with Visit");
        request.setStartDateTime(LocalDateTime.of(2025, 6, 20, 1, 34, 20));
        request.setEndDateTime(LocalDateTime.of(2025, 6, 20, 4, 34, 20));
        request.setNumTravellers(1);
        request.setThumbnailUrl("test.com");

        TripDto tripDto = tripService.createTrip(tripMapper.toEntity(request), userId);
        Long tripId = tripDto.getTripId();

        // Step 2: prepare two places
        List<Place> places = placeRepository.findAll();
        assertTrue(places.size() >= 2, "At least two places must exist in the database for this test.");

        Place firstPlace = places.get(0);
        Place secondPlace = places.get(1);

        LocalDateTime visitTime1 = LocalDateTime.of(2025, 6, 20, 2, 0, 0);
        LocalDateTime visitTime2 = LocalDateTime.of(2025, 6, 20, 3, 0, 0);

        // Step 3: add two TripVisit
        tripService.createOrUpdateTripVisit(tripId, firstPlace.getPlaceId(), visitTime1);
        tripService.createOrUpdateTripVisit(tripId, secondPlace.getPlaceId(), visitTime2);

        // Step 4: get and validate viewTrip
        Map<String, Object> tripDetail = tripService.viewTrip(tripId);

        TripDto resultTripDto = (TripDto) tripDetail.get("basicInfo");
        assertEquals(tripDto.getTripName(), resultTripDto.getTripName());

        List<Map<String, Object>> visits = (List<Map<String, Object>>) tripDetail.get("visits");
        assertEquals(2, visits.size());

        // Step 5: validate first visit
        Map<String, Object> visit1 = visits.get(0);
        assertEquals(visitTime1, visit1.get("visitTime"));
        Place returnedPlace1 = (Place) visit1.get("place");
        assertEquals(firstPlace.getPlaceName(), returnedPlace1.getPlaceName());

        // Step 6: validate second visit
        Map<String, Object> visit2 = visits.get(1);
        assertEquals(visitTime2, visit2.get("visitTime"));
        Place returnedPlace2 = (Place) visit2.get("place");
        assertEquals(secondPlace.getPlaceName(), returnedPlace2.getPlaceName());
    }
}
