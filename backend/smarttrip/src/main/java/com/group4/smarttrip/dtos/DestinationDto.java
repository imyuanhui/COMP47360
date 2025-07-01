package com.group4.smarttrip.dtos;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DestinationDto {
    private Long tripId;
    private Long destinationId;
    private String destinationName;
    private LocalDateTime visitTime;
}
