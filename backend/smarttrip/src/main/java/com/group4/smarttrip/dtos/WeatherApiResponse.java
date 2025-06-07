package com.group4.smarttrip.dtos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class WeatherApiResponse {

    private Current current;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Current {
        private double temp;
        private double humidity;
        private double wind_speed;
        private List<Weather> weather;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Weather {
        private int id;
        private String main;
    }

}
