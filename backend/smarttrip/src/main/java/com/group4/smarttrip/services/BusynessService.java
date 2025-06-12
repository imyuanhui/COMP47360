package com.group4.smarttrip.services;

import com.group4.smarttrip.dtos.ZoneBusynessDto;
import com.group4.smarttrip.entities.Zone;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class BusynessService {
    private final ZoneService zoneService;
    private final WeatherService weatherService;

    public ZoneBusynessDto getCurrentBusynessByZone(Long zoneId) {

        Zone zone = zoneService.getZoneById(zoneId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid zone id"));

        LocalDateTime time = LocalDateTime.now();
        int weatherCode = weatherService.getCurrentWeather().getWeatherId();

        double busynessScore = predictBusyness(zoneId, time, weatherCode);

        return new ZoneBusynessDto(
                zoneId,
                zone.getZoneName(),
                zone.getCentralLat(),
                zone.getCentralLon(),
                busynessScore,
                time);
    }

    public ZoneBusynessDto getFutureBusynessByZone(Long zoneId, LocalDateTime time) {

        Zone zone = zoneService.getZoneById(zoneId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid zone id"));

        Long timestamp = Timestamp.valueOf(time).getTime();
        int weatherCode = weatherService.getForecastWeather(timestamp).getWeatherId();

        double busynessScore = predictBusyness(zoneId, time, weatherCode);

        return new ZoneBusynessDto(
                zoneId,
                zone.getZoneName(),
                zone.getCentralLat(),
                zone.getCentralLon(),
                busynessScore,
                time);
    }

    public double predictBusyness(Long zoneId, LocalDateTime time, int weatherCode) {
        // to delete
        return zoneId * weatherCode;
    }
}
