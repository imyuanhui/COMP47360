package com.group4.smarttrip.services;

import com.group4.smarttrip.dtos.WeatherDto;
import com.group4.smarttrip.dtos.ZoneBusynessDto;
import com.group4.smarttrip.entities.Zone;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class BusynessService {
    private final ZoneService zoneService;
    private final WeatherService weatherService;
    private final FlowService flowService;

    private final RestTemplate restTemplate = new RestTemplate();

    public ZoneBusynessDto getCurrentBusynessByZone(Long zoneId) {
        System.out.println("Fetching current busyness for zone ID: " + zoneId);

        Zone zone = zoneService.getZoneById(zoneId)
                .orElseThrow(() -> {
                    System.out.println("Invalid zone ID provided: " + zoneId);
                    return new IllegalArgumentException("Invalid zone id");
                });

        LocalDateTime time = LocalDateTime.now();
        System.out.println("Current time: " + time);

        WeatherDto weather = weatherService.getCurrentWeather();
        System.out.println("Fetched current weather: " + weather);

        double busynessScore = predictBusyness(zone, weather, time);
        System.out.println("Predicted busyness score: " + busynessScore);

        String busynessLevel = "undefined";
        if (busynessScore <= 500) {
            busynessLevel = "low";
        } else if (busynessScore <= 1500) {
            busynessLevel = "med";
        } else {
            busynessLevel = "high";
        }

        System.out.println("Determined busyness level: " + busynessLevel);

        return new ZoneBusynessDto(
                zoneId,
                zone.getZoneName(),
                zone.getCentralLat(),
                zone.getCentralLon(),
                busynessScore,
                busynessLevel,
                time);
    }

    public ZoneBusynessDto getFutureBusynessByZone(Long zoneId, LocalDateTime time) {
        System.out.println("Fetching future busyness for zone ID: " + zoneId + " at time: " + time);

        Zone zone = zoneService.getZoneById(zoneId)
                .orElseThrow(() -> {
                    System.out.println("Invalid zone ID provided: " + zoneId);
                    return new IllegalArgumentException("Invalid zone id");
                });

        // Convert LocalDateTime → epoch seconds (Unix timestamp)
        long unixSeconds = time.atZone(ZoneId.systemDefault()).toEpochSecond();
        System.out.println("Converted time to Unix timestamp: " + unixSeconds);

        System.out.println(unixSeconds);

        // Call WeatherService with correct timestamp
        WeatherDto weather = weatherService.getForecastWeather(unixSeconds);
        System.out.println("Fetched forecast weather: " + weather);

        double busynessScore = predictBusyness(zone, weather, time);
        System.out.println("Predicted busyness score: " + busynessScore);

        String busynessLevel = "undefined";
        if (busynessScore <= 500) {
            busynessLevel = "low";
        } else if (busynessScore <= 1500) {
            busynessLevel = "med";
        } else {
            busynessLevel = "high";
        }

        System.out.println("Determined busyness level: " + busynessLevel);

        return new ZoneBusynessDto(
                zoneId,
                zone.getZoneName(),
                zone.getCentralLat(),
                zone.getCentralLon(),
                busynessScore,
                busynessLevel,
                time);
    }

    public double predictBusyness(Zone zone, WeatherDto weather, LocalDateTime time) {
//        Flow flow = flowService.getFlowByZoneAndTime(zone.getZoneId(), time);
//        double lat = zone.getCentralLat();
//        double lon = zone.getCentralLon();
        System.out.println("Starting prediction for zone: " + zone.getZoneName() + " at time: " + time);
        String formattedTime = time.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        System.out.println("Formatted timestamp: " + formattedTime);

        Map<String, Object> weatherMap = new HashMap<>();
        weatherMap.put("temp", weather.getTemperature());
        weatherMap.put("prcp", weather.getPrecipitation());
        weatherMap.put("weather_id", weather.getWeatherId());

        // For linear regression only
//        Map<String, Object> flowFeaturesMap = new HashMap<>();
//        flowFeaturesMap.put("log_mta_flow", flow.getLogMtaFlow());
//        flowFeaturesMap.put("log_taxi_flow", flow.getLogTaxiFlow());
//        flowFeaturesMap.put("fare_amount", flow.getFareAmount());
//        flowFeaturesMap.put("has_congestion_surcharge", flow.getHasCongestionSurcharge().intValue());
//        flowFeaturesMap.put("zone_avg_flow", flow.getZoneAvgFlow());

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("timestamp", formattedTime);
        requestBody.put("zone_id", zone.getZoneId());
        requestBody.put("zone_name", zone.getZoneName());
//        requestBody.put("lat", lat);
//        requestBody.put("lon", lon);
        requestBody.put("weather", weatherMap);
//        requestBody.put("flow_features", flowFeaturesMap);

        System.out.println("Request payload for ML model: " + requestBody);

        // deploy
//        String url = "http://flask-ml:5000/predict/xgb";
        // local test
        String url = "http://127.0.0.1:5000/predict/xgb";
        Map<String, Object> responseBody = restTemplate.postForObject(url, requestBody, Map.class);
        System.out.println("Received response from model: " + responseBody);

        return ((Number) responseBody.get("busyness_score")).doubleValue();
    }
}
