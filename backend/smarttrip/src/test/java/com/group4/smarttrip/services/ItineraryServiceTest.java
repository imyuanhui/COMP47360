package com.group4.smarttrip.services;

import com.group4.smarttrip.dtos.UserPreferences;
import com.group4.smarttrip.entities.Place;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class ItineraryServiceTest {

    @Autowired
    private ItineraryService itineraryService;

    @Test
    void testGenerateItinerary() {
        UserPreferences userPreferences = new UserPreferences("test","Times Square", 9, 9, Arrays.asList("cafe", "toys", "attraction"));

        List<Place> itinerary = itineraryService.generateItinerary(userPreferences);

        for (Place p: itinerary) {
            System.out.println(p.getPlaceName());
            System.out.println(p.getZone());
            System.out.println(p.getCategory());
        }

        assertTrue(itinerary.stream().anyMatch(p -> p.getCategory().equals("cafe")));
        assertTrue(itinerary.stream().anyMatch(p -> p.getCategory().equals("toys")));

        // Assert: total duration must not exceed preferences duration
        double totalDuration = itinerary.stream().mapToDouble(Place::getEstimatedDuration).sum();
        assertTrue(totalDuration <= userPreferences.getDuration(), "Total itinerary duration should fit in time budget");

    }

}
