package com.group4.smarttrip.services;

import com.group4.smarttrip.entities.Flow;
import com.group4.smarttrip.entities.FlowId;
import com.group4.smarttrip.repositories.FlowRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class FlowService {

    @Autowired
    private FlowRepository flowRepository;

    public Flow getFlowByZoneAndTime(Long zoneId, LocalDateTime timestamp) {
        int hour = timestamp.getHour();
        int weekday = timestamp.getDayOfWeek().getValue() - 1; // Monday = 0, Sunday = 6
        int month = 2; // for temporary use, will delete later

        FlowId id = new FlowId(zoneId, hour, weekday, month);
        return flowRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Flow data unavailable for zoneId=" + zoneId +
                        ", time=" + timestamp));
    }
}
