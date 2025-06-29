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
    void testOpenWeatherTimeMachineApiConnection_DefaultManhattan() {
        WeatherDto weatherDto = weatherService.getForecastWeather(1749475778L); // Jun 09 2025 13:29:38 GMT+0000

        System.out.println("Forecast weather of Manhattan:");
        System.out.println(weatherDto);

        assertNotNull(weatherDto);
        assertTrue(weatherDto.getTemperature() > -50 && weatherDto.getTemperature() < 50); // realistic range
        assertTrue(weatherDto.getHumidity() >= 0 && weatherDto.getHumidity() <= 100);
        assertTrue(weatherDto.getWindSpeed() >= 0);
        assertNotNull(weatherDto.getCondition());
    }

    @Test
    void testOpenWeatherApiConnection_CustomLatLon() {
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
    void testOpenWeatherTimeMachineApiConnection_CustomLatLon() {
        double lat = 53.33306;
        double lon = -6.24889;

        WeatherDto weatherDto = weatherService.getForecastWeather(lat, lon, 1749475778L); // Jun 09 2025 13:29:38 GMT+0000

        System.out.println("Forecast weather of Dublin:");
        System.out.println(weatherDto);

        assertNotNull(weatherDto);
        assertTrue(weatherDto.getTemperature() > -50 && weatherDto.getTemperature() < 50);
        assertTrue(weatherDto.getHumidity() >= 0 && weatherDto.getHumidity() <= 100);
        assertTrue(weatherDto.getWindSpeed() >= 0);
        assertNotNull(weatherDto.getCondition());
    }

    @Test
    void testCacheStoresAndReturnsSameObject() {

        WeatherDto firstCurr = weatherService.getCurrentWeather();
        WeatherDto secondCurr = weatherService.getCurrentWeather();

        WeatherDto firstFore = weatherService.getForecastWeather(1749475778L);
        WeatherDto secondFore = weatherService.getForecastWeather(1749475778L);

        System.out.println("First current weather DTO: " + firstCurr);
        System.out.println("Second current weather DTO: " + secondCurr);

        System.out.println("First forecast weather DTO: " + firstFore);
        System.out.println("Second forecast weather DTO: " + secondFore);

        assertSame(firstCurr, secondCurr, "Should return the cached WeatherDto object for current weather");
        assertSame(firstFore, secondFore, "Should return the cached WeatherDto object for forecast weather");
    }

    @Test
    void testCacheDifferentForDifferentCoordinates() {
        double lat = 40.703277;
        double lon = -74.017028;
        long dt = 1749475778L;

        WeatherDto manhattan = weatherService.getCurrentWeather();
        WeatherDto manhattanForecast = weatherService.getForecastWeather(dt);

        WeatherDto custom = weatherService.getCurrentWeather(lat, lon);
        WeatherDto customForecast = weatherService.getForecastWeather(lat, lon, dt);

        System.out.println("Manhattan cached current DTO: " + manhattan);
        System.out.println("Custom location current DTO: " + custom);

        System.out.println("Manhattan cached forecast DTO: " + manhattanForecast);
        System.out.println("Custom location forecast DTO: " + customForecast);

        assertNotSame(manhattan, custom, "Custom location should not use the same cache entry for current weather");
        assertNotSame(manhattanForecast, customForecast, "Custom location should not use the same cache entry for forecast weather");
    }

    @Test
    void testCacheExpiresAfterTTL() throws InterruptedException {
        long dt = 1749475778L;

        WeatherDto firstCurr = weatherService.getCurrentWeather();
        WeatherDto firstFore = weatherService.getForecastWeather(dt);
        Thread.sleep(5500); // wait 5.5 seconds (longer than TTL)

        WeatherDto secondCurr = weatherService.getCurrentWeather();
        WeatherDto secondFore = weatherService.getForecastWeather(dt);

        assertNotSame(firstCurr, secondCurr, "After TTL, should not return the same cached object for current weather");
        assertNotSame(firstFore, secondFore, "After TTL, should not return the same cached object for forecast weather");
    }

}
