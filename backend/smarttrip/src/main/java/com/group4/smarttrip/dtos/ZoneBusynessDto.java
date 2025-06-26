package com.group4.smarttrip.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class ZoneBusynessDto {
    private Long zoneId;
    private String zoneName;
    private double centralLat;
    private double centralLon;
    private double busynessScore;
    private LocalDateTime time;
}
