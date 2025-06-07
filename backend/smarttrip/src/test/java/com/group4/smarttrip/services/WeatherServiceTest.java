package com.group4.smarttrip.services;

import com.group4.smarttrip.dtos.WeatherDto;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class WeatherServiceTest {

    @Autowired
    private WeatherService weatherService;

    @Test
    void testOpenWeatherApiConnection_DefaultManhattan() {
        WeatherDto weatherDto = weatherService.getCurrentWeather();

        System.out.println("Current weather of Manhattan:");
        System.out.println(weatherDto);

        assertNotNull(weatherDto);
        assertTrue(weatherDto.getTemperature() > -50 && weatherDto.getTemperature() < 50); // realistic range
        assertTrue(weatherDto.getHumidity() >= 0 && weatherDto.getHumidity() <= 100);
        assertTrue(weatherDto.getWindSpeed() >= 0);
        assertNotNull(weatherDto.getCondition());
    }

    @Test
    void testExternalApiConnection_CustomLatLon() {
        double lat = 53.33306;
        double lon = -6.24889;

        WeatherDto weatherDto = weatherService.getCurrentWeather(lat, lon);

        System.out.println("Current weather of Dublin:");
        System.out.println(weatherDto);

        assertNotNull(weatherDto);
        assertTrue(weatherDto.getTemperature() > -50 && weatherDto.getTemperature() < 50);
        assertTrue(weatherDto.getHumidity() >= 0 && weatherDto.getHumidity() <= 100);
        assertTrue(weatherDto.getWindSpeed() >= 0);
        assertNotNull(weatherDto.getCondition());
    }

    @Test
    void testCacheStoresAndReturnsSameObject() {

        WeatherDto first = weatherService.getCurrentWeather();
        WeatherDto second = weatherService.getCurrentWeather();

        System.out.println("First DTO: " + first);
        System.out.println("Second DTO: " + second);

        assertSame(first, second, "Should return the cached WeatherDto object");
    }

    @Test
    void testCacheDifferentForDifferentCoordinates() {
        WeatherDto manhattan = weatherService.getCurrentWeather();

        double lat = 40.703277;
        double lon = -74.017028;
        WeatherDto custom = weatherService.getCurrentWeather(lat, lon);

        System.out.println("Manhattan cached DTO: " + manhattan);
        System.out.println("Custom location DTO: " + custom);

        assertNotSame(manhattan, custom, "Custom location should not use the same cache entry");
    }

    @Test
    void testCacheExpiresAfterTTL() throws InterruptedException {
        WeatherDto first = weatherService.getCurrentWeather();
        Thread.sleep(5500); // wait 5.5 seconds (longer than TTL)

        WeatherDto second = weatherService.getCurrentWeather();

        assertNotSame(first, second, "After TTL, should not return the same cached object");
    }

}
