package com.group4.smarttrip.services;

import com.group4.smarttrip.entities.Flow;
import com.group4.smarttrip.repositories.FlowRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
public class FlowServiceTest {
    @Autowired
    private FlowService flowService;

    @Autowired
    private FlowRepository flowRepository;

    @Test
    public void testGetFlowByZoneAndTime() {
        LocalDateTime timestamp = LocalDateTime.now();

        Flow flow = flowService.getFlowByZoneAndTime(1L, timestamp);
        System.out.println(flow);

        assertNotNull(flow);
    }
}
