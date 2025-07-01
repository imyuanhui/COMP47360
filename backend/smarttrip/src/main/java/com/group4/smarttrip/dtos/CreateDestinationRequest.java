package com.group4.smarttrip.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class CreateDestinationRequest {
    private Long tripId;
    private String destinationName;
    private double lat;
    private double lon;
    private LocalDateTime visitTime;
}
