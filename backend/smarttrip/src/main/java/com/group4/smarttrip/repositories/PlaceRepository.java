package com.group4.smarttrip.repositories;

import com.group4.smarttrip.entities.Place;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PlaceRepository extends JpaRepository<Place, Long> {
    List<Place> findByZone_ZoneId(Long zoneId);
    List<Place> findByZone_ZoneIdAndCategory(Long zoneId, String category);
    List<Place> findByCategory(String category);
}
