package com.group4.smarttrip.dtos;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateUpdateTripRequest {
    private String tripName;
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
    private Integer numTravellers;
    private String thumbnailUrl;
}
