package com.group4.smarttrip.repositories;

import com.group4.smarttrip.entities.Trip;
import com.group4.smarttrip.entities.TripVisit;
import com.group4.smarttrip.entities.TripVisitId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TripVisitRepository extends JpaRepository<TripVisit, TripVisitId> {
    List<TripVisit> findAllByTrip(Trip trip);
}
