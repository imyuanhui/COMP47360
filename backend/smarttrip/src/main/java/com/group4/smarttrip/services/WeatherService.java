package com.group4.smarttrip.services;

import com.group4.smarttrip.dtos.WeatherApiResponse;
import com.group4.smarttrip.dtos.WeatherDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.sql.Timestamp;
import java.time.Duration;
import java.time.LocalDateTime;

@Service
public class WeatherService {

    @Value("${open-weather.api.key}")
    private String apiKey;

    @Value("${open-weather.api.url}")
    private String apiUrl;

    @Value("${open-weather.api.units}")
    private String units;

    private final RestTemplate restTemplate = new RestTemplate();

    private final double defaultLat = 40.776676;
    private final double defaultLon = -73.971321;

    @Cacheable(value = "weatherCache", key = "'manhattan'")
    public  WeatherDto getCurrentWeather() {
        return getCurrentWeather(defaultLat, defaultLon);
    }

    @Cacheable(value = "weatherCache", key = "#lat + '_' + #lon")
    public WeatherDto getCurrentWeather(double lat, double lon) {
        String url = String.format("%s?lat=%.4f&lon=%.4f&appid=%s&exclude=minutely,hourly,daily,alerts&units=%s",
                apiUrl, lat, lon, apiKey, units);

        try {
            WeatherApiResponse response = restTemplate.getForObject(url, WeatherApiResponse.class);
            WeatherApiResponse.Current current = response.getCurrent();
            WeatherApiResponse.Weather weather = current.getWeather().get(0);

            Double precipitation = current.getRain() != null ? current.getRain().getOneHour() : 0.0;

            return new WeatherDto(
                    current.getTemp(),
                    current.getHumidity(),
                    current.getWind_speed(),
                    weather.getId(),
                    weather.getMain(),
                    precipitation,
                    LocalDateTime.now()
            );
        } catch (RuntimeException e) {
            throw new RuntimeException("Weather API return invalid response");
        }
    }

    @Cacheable(value = "weatherCache", key = "'manhattan_' + #dt")
    public WeatherDto getForecastWeather(Long dt) {
        return getForecastWeather(defaultLat, defaultLon, dt);
    }

    @Cacheable(value = "weatherCache", key = "#lat + '_' + #lon + '_' + #dt")
    public WeatherDto getForecastWeather(double lat, double lon, Long dt) {
        String url = String.format("%s/timemachine?lat=%.4f&lon=%.4f&dt=%s&appid=%s&units=%s",
                apiUrl, lat, lon, dt, apiKey, units);

        try {
            WeatherApiResponse response = restTemplate.getForObject(url, WeatherApiResponse.class);
            WeatherApiResponse.DataPoint forecast = response.getData().get(0);
            WeatherApiResponse.Weather weather = forecast.getWeather().get(0);

            Double precipitation = forecast.getRain() != null ? forecast.getRain().getOneHour() : 0.0;

            LocalDateTime localDateTime = new Timestamp(forecast.getDt() * 1000).toLocalDateTime();

            return new WeatherDto(
                    forecast.getTemp(),
                    forecast.getHumidity(),
                    forecast.getWind_speed(),
                    weather.getId(),
                    weather.getMain(),
                    precipitation,
                    localDateTime
            );
        } catch (RuntimeException e) {
            throw new RuntimeException("Weather API return invalid response");
        }
    }
}
