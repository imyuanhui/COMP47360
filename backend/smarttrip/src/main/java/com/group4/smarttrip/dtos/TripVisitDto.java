package com.group4.smarttrip.dtos;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TripVisitDto {
    private Long tripId;
    private Long placeId;
    private LocalDateTime visitTime;
}
