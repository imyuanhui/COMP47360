package com.group4.smarttrip.services;

import com.group4.smarttrip.dtos.TripDto;
import com.group4.smarttrip.entities.Place;
import com.group4.smarttrip.entities.Trip;
import com.group4.smarttrip.entities.TripVisit;
import com.group4.smarttrip.mappers.TripMapper;
import com.group4.smarttrip.repositories.PlaceRepository;
import com.group4.smarttrip.repositories.TripRepository;
import com.group4.smarttrip.repositories.TripVisitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TripService {
    private final TripRepository tripRepository;
    private final TripMapper tripMapper;
    private final TripVisitRepository tripVisitRepository;
    private final PlaceRepository placeRepository;


    public TripDto createTrip(Trip trip, Long userId) {
        trip.setUserId(userId);
        trip.setCreatedAt(LocalDateTime.now());
        trip.setUpdatedAt(LocalDateTime.now());

        Trip savedTrip = tripRepository.save(trip);
        return tripMapper.toDto(savedTrip);
    }

    public List<TripDto> getUserTrips(Long userId, int page) {
        int pageSize = 10;
        PageRequest pageRequest = PageRequest.of(page - 1, pageSize, Sort.by("updatedAt").descending());

        return tripRepository.findAllByUserId(userId, pageRequest)
                .stream()
                .map(tripMapper::toDto)
                .collect(Collectors.toList());
    }

    public Trip getTripById(Long tripId) {
        return tripRepository.findById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found"));
    }

    public void deleteTrip(Long tripId) {
        if (!tripRepository.existsById(tripId)) {
            throw new IllegalArgumentException("Trip not found");
        }
        tripRepository.deleteById(tripId);
    }

    public void createTripVisit(Long tripId, Long placeId, LocalDateTime time) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found"));

        Place place = placeRepository.findById(placeId)
                .orElseThrow(() -> new IllegalArgumentException("Place not found"));

        TripVisit visit = new TripVisit(trip, place, time);
        tripVisitRepository.save(visit);
    }


    public Map<String, Object> viewTrip(Long tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found"));

        List<TripVisit> tripVisits = tripVisitRepository.findAllByTrip(trip);

        List<Map<String, Object>> visits = tripVisits.stream()
                .map(visit -> Map.of(
                        "visitTime", visit.getVisitTime(),
                        "place", visit.getPlace()
                ))
                .toList();

        return Map.of(
                "basicInfo", tripMapper.toDto(trip),
                "visits", visits
        );
    }

//    public TripDto updateTrip(Long tripId, CreateTripRequest request) {
//        Trip trip = tripRepository.findById(tripId)
//                .orElseThrow(() -> new IllegalArgumentException("Trip not found"));
//
//        tripMapper.updateTrip(request, trip);
//
//        trip.setUpdatedAt(LocalDateTime.now());
//
//        Trip updatedTrip = tripRepository.save(trip);
//        return tripMapper.toDto(updatedTrip);
//    }
}
