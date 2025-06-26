package com.group4.smarttrip.repositories;

import com.group4.smarttrip.entities.Place;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlaceRepository extends JpaRepository<Place, Long> {
}
