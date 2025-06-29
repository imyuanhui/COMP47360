package com.group4.smarttrip.services;

import com.group4.smarttrip.dtos.ZoneBusynessDto;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class BusynessServiceTest {
    @Autowired
    private BusynessService busynessService;

    private Long zoneId1 = 1L;
    private Long zoneId2 = 2L;

    @Test
    void testGetCurrentBusynessByZone() {
        ZoneBusynessDto zoneBusynessDto1 = busynessService.getCurrentBusynessByZone(zoneId1);
        ZoneBusynessDto zoneBusynessDto2 = busynessService.getCurrentBusynessByZone(zoneId2);
        System.out.println(zoneBusynessDto1);
        assertNotNull(zoneBusynessDto1);
        System.out.println(zoneBusynessDto2);
        assertNotNull(zoneBusynessDto2);
        assertNotEquals(zoneBusynessDto1.getBusynessScore(), zoneBusynessDto2.getBusynessScore());
        assertNotEquals(zoneBusynessDto1.getZoneId(), zoneBusynessDto2.getZoneId());
    }

}
