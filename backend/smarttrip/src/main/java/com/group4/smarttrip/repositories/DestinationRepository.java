package com.group4.smarttrip.repositories;

import com.group4.smarttrip.entities.Destination;
import com.group4.smarttrip.entities.Trip;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DestinationRepository extends JpaRepository<Destination, Long> {
    List<Destination> findAllByTrip(Trip trip);
}
