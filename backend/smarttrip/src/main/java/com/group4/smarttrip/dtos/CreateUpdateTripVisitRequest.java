package com.group4.smarttrip.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class CreateUpdateTripVisitRequest {
    private Long tripId;
    private Long placeId;
    private LocalDateTime visitTime;
}
