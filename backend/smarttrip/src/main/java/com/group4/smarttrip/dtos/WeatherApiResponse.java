package com.group4.smarttrip.dtos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class WeatherApiResponse {

    private Current current; // from /onecall
    private List<DataPoint> data; // from /timemachine

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
    public static class DataPoint {
        private long dt;
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
