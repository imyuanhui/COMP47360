package com.group4.smarttrip.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class WeatherDto {
    private double temperature;
    private double humidity;
    private double windSpeed;
    private int weatherId;
    private String condition;
    private LocalDateTime lastUpdatedTime;
}
