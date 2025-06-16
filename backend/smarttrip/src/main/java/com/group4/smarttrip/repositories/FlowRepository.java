package com.group4.smarttrip.repositories;

import com.group4.smarttrip.entities.Flow;
import com.group4.smarttrip.entities.FlowId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FlowRepository extends JpaRepository<Flow, FlowId> {
}
