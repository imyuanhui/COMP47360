package com.group4.smarttrip.services;

import com.group4.smarttrip.dtos.WeatherDto;
import com.group4.smarttrip.dtos.ZoneBusynessDto;
import com.group4.smarttrip.entities.Flow;
import com.group4.smarttrip.entities.Zone;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.sql.Timestamp;
import java.time.LocalDateTime;
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

        Zone zone = zoneService.getZoneById(zoneId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid zone id"));

        LocalDateTime time = LocalDateTime.now();
        WeatherDto weather = weatherService.getCurrentWeather();

        double busynessScore = predictBusyness(zone, weather, time);

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
        WeatherDto weather = weatherService.getForecastWeather(timestamp);

        double busynessScore = predictBusyness(zone, weather, time);

        return new ZoneBusynessDto(
                zoneId,
                zone.getZoneName(),
                zone.getCentralLat(),
                zone.getCentralLon(),
                busynessScore,
                time);
    }

    public double predictBusyness(Zone zone, WeatherDto weather, LocalDateTime time) {
//        Flow flow = flowService.getFlowByZoneAndTime(zone.getZoneId(), time);
//        double lat = zone.getCentralLat();
//        double lon = zone.getCentralLon();
        String formattedTime = time.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

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

        String url = "http://127.0.0.1:5000/predict/randomforest";
        Map<String, Object> responseBody = restTemplate.postForObject(url, requestBody, Map.class);
        return ((Number) responseBody.get("busyness_score")).doubleValue();
    }
}
