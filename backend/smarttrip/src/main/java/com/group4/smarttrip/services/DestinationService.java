package com.group4.smarttrip.services;

import com.group4.smarttrip.dtos.CreateDestinationRequest;
import com.group4.smarttrip.dtos.DestinationDto;
import com.group4.smarttrip.dtos.UpdateDestinationRequest;
import com.group4.smarttrip.entities.Destination;
import com.group4.smarttrip.entities.Trip;
import com.group4.smarttrip.mappers.DestinationMapper;
import com.group4.smarttrip.repositories.DestinationRepository;
import com.group4.smarttrip.repositories.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DestinationService {

    private final DestinationRepository destinationRepository;
    private final DestinationMapper destinationMapper;
    private final TripRepository tripRepository;

    public List<DestinationDto> getDestinationsByTripId(Long tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found: " + tripId));

        List<Destination> destinations = destinationRepository.findAllByTrip(trip);

        return destinations.stream()
                .map(destinationMapper::toDto)
                .toList();
    }

    @Transactional
    public DestinationDto createDestination(CreateDestinationRequest request) {
        Long tripId = request.getTripId();
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found: " + tripId));

        Destination destination = destinationMapper.toEntity(request);
        destination.setTrip(trip);
        destinationRepository.save(destination);

        return destinationMapper.toDto(destination);
    }

    @Transactional
    public void deleteDestination(Long destinationId) {
        destinationRepository.findById(destinationId)
                .orElseThrow(() -> new IllegalArgumentException("Destination not found: " + destinationId));

        destinationRepository.deleteById(destinationId);
    }

    @Transactional
    public DestinationDto updateDestination(UpdateDestinationRequest request) {
        Destination destination = destinationRepository.findById(request.getDestinationId())
                .orElseThrow(() -> new IllegalArgumentException("Destination not found: " + request.getDestinationId()));

        destinationMapper.update(request, destination);

        return destinationMapper.toDto(destinationRepository.save(destination));
    }
}
