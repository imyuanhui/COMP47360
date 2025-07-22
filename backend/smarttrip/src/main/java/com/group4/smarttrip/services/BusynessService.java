package com.group4.smarttrip.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.group4.smarttrip.dtos.WeatherDto;
import com.group4.smarttrip.dtos.ZoneBusynessDto;
import com.group4.smarttrip.entities.Zone;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

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

    @Value("${ml.service.url}")
    private String mlServiceUrl;

    public ZoneBusynessDto getCurrentBusynessByZone(Long zoneId) {
        return getBusyness(zoneId, LocalDateTime.now(), false);
    }

    public ZoneBusynessDto getFutureBusynessByZone(Long zoneId, LocalDateTime time) {
        return getBusyness(zoneId, time, true);
    }

    private ZoneBusynessDto getBusyness(Long zoneId, LocalDateTime time, boolean isFuture) {
        System.out.printf("Fetching %s busyness for zone ID: %d at %s%n",
                isFuture ? "future" : "current", zoneId, time);

        Zone zone = zoneService.getZoneById(zoneId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid zone id"));

        WeatherDto weather = isFuture
                ? weatherService.getForecastWeather(time.atZone(ZoneId.systemDefault()).toEpochSecond())
                : weatherService.getCurrentWeather();

        double busynessScore;
        try {
            busynessScore = predictBusyness(zone, weather, time);
        } catch (Exception e) {
            System.err.println("[ERROR] Prediction failed: " + e.getMessage());
            busynessScore = 0;
        }

        String busynessLevel = (busynessScore <= 1512) ? "low" :
                (busynessScore <= 5094) ? "med" : "high";

        return new ZoneBusynessDto(
                zoneId,
                zone.getZoneName(),
                zone.getCentralLat(),
                zone.getCentralLon(),
                busynessScore,
                busynessLevel,
                time
        );
    }

    public double predictBusyness(Zone zone, WeatherDto weather, LocalDateTime time) throws JsonProcessingException {
        String formattedTime = time.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

        Map<String, Object> weatherMap = new HashMap<>();
        weatherMap.put("temp", weather.getTemperature());
        weatherMap.put("prcp", weather.getPrecipitation());
        weatherMap.put("weather_id", weather.getWeatherId());

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("timestamp", formattedTime);
        requestBody.put("zone_id", zone.getZoneId());
        requestBody.put("zone_name", zone.getZoneName());
        requestBody.put("weather", weatherMap);

        // 调试打印请求体
        String json = new ObjectMapper().writeValueAsString(requestBody);
        System.out.println("[DEBUG] Sending request to ML model: " + json);

        String url = mlServiceUrl + "/predict/xgb";
        Map<String, Object> responseBody = restTemplate.postForObject(url, requestBody, Map.class);

        System.out.println("[DEBUG] Received response: " + responseBody);
        return ((Number) responseBody.get("busyness_score")).doubleValue();
    }
}
