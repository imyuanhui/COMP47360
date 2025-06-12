package com.group4.smarttrip.repositories;

import com.group4.smarttrip.entities.Trip;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TripRepository extends JpaRepository<Trip, Long> {
   List<Trip> findAllByUserEmail(String email, PageRequest pageRequest);
}
