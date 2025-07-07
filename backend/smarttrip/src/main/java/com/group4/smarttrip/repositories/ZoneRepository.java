package com.group4.smarttrip.repositories;

import com.group4.smarttrip.entities.Zone;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ZoneRepository extends JpaRepository<Zone, Long> {
    List<Zone> findByZoneName(String zoneName);
}
