package com.group4.smarttrip.services;

import com.group4.smarttrip.dtos.LocationKey;
import com.group4.smarttrip.dtos.Weather;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.lang.reflect.Array;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class WeatherService {

    private static final long FRESHNESS_MINUTES = 60;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${open-weather.api.key}")
    private String apiKey;

    @Value("${open-weather.api.url}")
    private String apiUrl;

    @Value("${open-weather.api.units}")
    private String units;

    private Map<LocationKey, List<Weather>> cache = new ConcurrentHashMap<>();

    public Weather getCurrentWeather(double lat, double lon) {
        LocationKey locationKey = new LocationKey(lat, lon);

        List<Weather> bucket = cache.getOrDefault(locationKey, new CopyOnWriteArrayList<>());

        if (Array.getLength(bucket) > 0) {
            for (Weather w : bucket) {
                if (Duration.between(w.getLastUpdatedTime(), LocalDateTime.now()).toMinutes() < FRESHNESS_MINUTES) {
                    return w;
                }
            }
        }

        String url = String.format("%s?lat=%.4f&lon=%.4f&appid=%s&units=%s", apiUrl, lat, lon, apiKey, units);
        var response = restTemplate.getForObject(url, Object.class);

        Weather weather = new Weather(
                response.getMain().getTemp(),
                response.getMain().getHumidity(),
                response.getMain().getWind().getSpeed(),
                response.getWeather().getMain(),
                LocalDateTime.now(),
                locationKey
        );

        bucket.add(weather);
        cache.putIfAbsent(locationKey, bucket);

        return weather;
    }
}
