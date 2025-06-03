package com.group4.smarttrip.dtos;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class Weather {
    private float temperature;
    private int humidity;
    private float windSpeed;
    private String main;
    private LocalDateTime lastUpdatedTime;
    private LocationKey locationKey;
}
