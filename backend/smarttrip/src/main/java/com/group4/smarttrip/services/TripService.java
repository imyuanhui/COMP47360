package com.group4.smarttrip.services;

import com.group4.smarttrip.dtos.CreateUpdateTripRequest;
import com.group4.smarttrip.dtos.TripDto;
import com.group4.smarttrip.entities.Trip;
import com.group4.smarttrip.mappers.TripMapper;
import com.group4.smarttrip.repositories.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TripService {
    private final TripRepository tripRepository;
    private final TripMapper tripMapper;

    public TripDto createTrip(Trip trip, String email) {
        trip.setUserEmail(email);
        trip.setCreatedAt(LocalDateTime.now());
        trip.setUpdatedAt(LocalDateTime.now());

        Trip savedTrip = tripRepository.save(trip);
        return tripMapper.toDto(savedTrip);
    }

    public TripDto updateTrip(Long tripId, CreateUpdateTripRequest request) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found"));

        tripMapper.updateTrip(request, trip);

        trip.setUpdatedAt(LocalDateTime.now());

        Trip updatedTrip = tripRepository.save(trip);
        return tripMapper.toDto(updatedTrip);
    }


    public List<TripDto> getUserTrips(String email, int page) {
        int pageSize = 10;
        PageRequest pageRequest = PageRequest.of(page - 1, pageSize, Sort.by("updatedAt").descending());

        return tripRepository.findAllByUserEmail(email, pageRequest)
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
}
